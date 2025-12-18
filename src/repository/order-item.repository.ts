import db from "../database/database";

class OrderItemRepository {
  async create(
    client: any,
    orderId: number,
    productId: number,
    quantity: number,
    price: number
  ) {
    await client.query(
      `INSERT INTO order_item (order_id, product_id, quantity, price) 
       VALUES ($1, $2, $3, $4)`,
      [orderId, productId, quantity, price]
    );
  }

  async findByOrderId(orderId: number) {
    const result = await db.query(
      `SELECT oi.*, p.name as product_name, p.images as product_images
       FROM order_item oi
       JOIN product p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );
    return result.rows;
  }

  async getExistingItems(client: any, orderId: number) {
    const result = await client.query(
      `SELECT product_id, quantity FROM order_item WHERE order_id = $1`,
      [orderId]
    );
    return result.rows;
  }

  async deleteByOrderId(client: any, orderId: number) {
    await client.query(`DELETE FROM order_item WHERE order_id = $1`, [orderId]);
  }
}

export default new OrderItemRepository();
