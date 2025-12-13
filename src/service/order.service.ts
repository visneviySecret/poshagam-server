import db from "../database/database";
import OrderRepository from "../repository/order.repository";
import OrderItemRepository from "../repository/order-item.repository";
import ProductStockService from "./product-stock.service";

class OrderService {
  private async withTransaction<T>(
    callback: (client: any) => Promise<T>
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

  private async processOrderItems(
    client: any,
    orderId: number,
    items: Array<{ product_id: number; count: number; price?: number }>
  ) {
    let totalAmount = 0;

    for (const item of items) {
      const product = await ProductStockService.validateAndGetProduct(
        client,
        item.product_id,
        item.count
      );

      const itemPrice = item.price || product.price;
      totalAmount += itemPrice * item.count;

      await OrderItemRepository.create(
        client,
        orderId,
        item.product_id,
        item.count,
        itemPrice
      );
    }

    return totalAmount;
  }

  async createOrder(
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
      const order = await OrderRepository.create(
        client,
        userId,
        dto.status || "pending"
      );

      const totalAmount = await this.processOrderItems(
        client,
        order.id,
        dto.items
      );

      await OrderRepository.updateAmount(client, order.id, totalAmount);

      // TODO: здесь должен возвращаться order_id
      console.log("order");
      return await OrderRepository.getWithItems(order.id);
    });
  }

  async updateOrder(
    orderId: number,
    userId: number,
    dto: {
      items: Array<{ product_id: number; count: number; price?: number }>;
    }
  ) {
    return this.withTransaction(async (client) => {
      const order = await OrderRepository.findByIdAndUser(
        client,
        orderId,
        userId
      );

      if (!order) {
        throw new Error("Order not found or access denied");
      }

      if (order.status !== "pending") {
        throw new Error(`Cannot update order with status: ${order.status}`);
      }

      await OrderItemRepository.deleteByOrderId(client, orderId);

      const totalAmount = await this.processOrderItems(
        client,
        orderId,
        dto.items
      );

      await client.query(
        `UPDATE "order" SET amount = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [totalAmount, orderId]
      );

      return await OrderRepository.getWithItems(orderId);
    });
  }

  async getOrderById(orderId: number) {
    const order = await OrderRepository.getWithItems(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  }

  async getOrderByUser(userId: number) {
    const order = await OrderRepository.findByUser(userId);
    return OrderRepository.getWithItems(order.id);
  }

  async updateOrderStatus(orderId: number, status: string) {
    return OrderRepository.updateStatus(orderId, status);
  }

  async deleteAllOrdersByUser(userId: number) {
    return this.withTransaction(async (client) => {
      const orders = await client.query(
        `SELECT id FROM "order" WHERE user_id = $1`,
        [userId]
      );

      const orderIds = orders.rows.map((row) => row.id);

      if (orderIds.length === 0) {
        return { deletedCount: 0 };
      }

      for (const orderId of orderIds) {
        await OrderItemRepository.deleteByOrderId(client, orderId);
      }

      await client.query(`DELETE FROM "order" WHERE user_id = $1`, [userId]);

      return { deletedCount: orderIds.length };
    });
  }
}

export default new OrderService();
