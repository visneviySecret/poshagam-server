import db from "../database/database";

class CartItemRepository {
  async create(
    client: any,
    cartId: number,
    productId: number,
    quantity: number,
    price: number
  ) {
    await client.query(
      `INSERT INTO cart_item (cart_id, product_id, quantity, price) 
       VALUES ($1, $2, $3, $4)`,
      [cartId, productId, quantity, price]
    );
  }

  async findByCartId(cartId: number) {
    const result = await db.query(
      `SELECT oi.*, p.name as product_name, p.images as product_images
       FROM cart_item oi
       JOIN product p ON oi.product_id = p.id
       WHERE oi.cart_id = $1`,
      [cartId]
    );
    return result.rows;
  }

  async getExistingItems(client: any, cartId: number) {
    const result = await client.query(
      `SELECT product_id, quantity FROM cart_item WHERE cart_id = $1`,
      [cartId]
    );
    return result.rows;
  }

  async deleteByCartId(client: any, cartId: number) {
    await client.query(`DELETE FROM cart_item WHERE cart_id = $1`, [cartId]);
  }
}

export default new CartItemRepository();
