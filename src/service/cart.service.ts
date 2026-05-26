import db from "../database/database";
import CartRepository from "../repository/cart.repository";
import CartItemRepository from "../repository/cart-item.repository";
import ProductStockService from "./product-stock.service";
import S3Service from "./s3.service";
import { PoolClient } from "pg";

class CartService {
  private async withTransaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  private async enrichCartItems(items: any[]) {
    return Promise.all(
      items.map(async (item) => {
        let keys: string[] = [];
        try {
          keys = JSON.parse(item.product_images || "[]");
        } catch {
          keys = [];
        }

        const previewKey = keys[0];
        const imageUrl = previewKey
          ? await S3Service.getFileUrl(previewKey)
          : null;

        return {
          ...item,
          images: imageUrl ? [imageUrl] : [],
        };
      })
    );
  }

  private async withEnrichedItems(cart: any) {
    if (!cart?.items?.length) {
      return cart;
    }
    cart.items = await this.enrichCartItems(cart.items);
    return cart;
  }

  private async processCartItems(
    client: any,
    cartId: number,
    items: Array<{ product_id: number; count: number; price?: number }>
  ) {
    let totalAmount = 0;

    for (const item of items) {
      const product = await ProductStockService.validateAndGetProduct(
        item.product_id,
        client
      );

      const itemPrice = item.price || product.price;
      totalAmount += itemPrice * item.count;

      await CartItemRepository.create(
        client,
        cartId,
        item.product_id,
        item.count,
        itemPrice
      );
    }

    return totalAmount;
  }

  async createCart(
    userId: number,
    dto: {
      items: Array<{
        product_id: number;
        count: number;
        price?: number;
      }>;
      status?: string;
    }
  ) {
    return this.withTransaction(async (client) => {
      const cart = await CartRepository.create(
        client,
        userId,
        dto.status || "pending"
      );

      const totalAmount = await this.processCartItems(
        client,
        cart.id,
        dto.items
      );

      await CartRepository.updateAmount(client, cart.id, totalAmount);

      const result = await CartRepository.getWithItems(cart.id, client);
      return this.withEnrichedItems(result);
    });
  }

  async updateCart(
    cartId: number,
    userId: number,
    dto: {
      items: Array<{ product_id: number; count: number; price?: number }>;
    }
  ) {
    return this.withTransaction(async (client) => {
      const cart = await CartRepository.findByIdAndUser(client, cartId, userId);

      if (!cart) {
        throw new Error("Cart not found or access denied");
      }

      if (cart.status !== "pending") {
        throw new Error(`Cannot update cart with status: ${cart.status}`);
      }

      await CartItemRepository.deleteByCartId(client, cartId);

      const totalAmount = await this.processCartItems(
        client,
        cartId,
        dto.items
      );

      await client.query(
        `UPDATE cart SET amount = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [totalAmount, cartId]
      );

      const result = await CartRepository.getWithItems(cartId);
      return this.withEnrichedItems(result);
    });
  }

  async getCartById(cartId: number) {
    const cart = await CartRepository.getWithItems(cartId);
    if (!cart) {
      throw new Error("Cart not found");
    }
    return this.withEnrichedItems(cart);
  }

  async getCartByUser(userId: number) {
    const cart = await CartRepository.findPendingByUser(userId);
    if (!cart) {
      return null;
    }
    const result = await CartRepository.getWithItems(cart.id);
    return this.withEnrichedItems(result);
  }

  async updateCartStatus(cartId: number, status: string) {
    return CartRepository.updateStatus(cartId, status);
  }

  async clearUserCarts(userId: number) {
    return this.withTransaction(async (client) => {
      const carts = await client.query(
        `SELECT id FROM cart WHERE user_id = $1 AND status = 'pending'`,
        [userId]
      );

      const cartIds = carts.rows.map((row) => row.id);

      if (cartIds.length === 0) {
        return { deletedCount: 0 };
      }

      for (const cartId of cartIds) {
        await CartItemRepository.deleteByCartId(client, cartId);
      }

      await client.query(
        `DELETE FROM cart WHERE user_id = $1 AND status = 'pending'`,
        [userId]
      );

      return { deletedCount: cartIds.length };
    });
  }
}

export default new CartService();
