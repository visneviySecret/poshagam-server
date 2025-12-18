import db from "../database/database";

class OrderRepository {
  async create(client: any, userId: number, status: string) {
    const result = await client.query(
      `INSERT INTO "order" (user_id, status, amount) 
       VALUES ($1, $2, 0) RETURNING *`,
      [userId, status]
    );
    return result.rows[0];
  }

  async findById(client: any, orderId: number) {
    const result = await client.query(`SELECT * FROM "order" WHERE id = $1`, [
      orderId,
    ]);
    return result.rows[0];
  }

  async findByIdAndUser(client: any, orderId: number, userId: number) {
    const result = await client.query(
      `SELECT * FROM "order" WHERE id = $1 AND user_id = $2`,
      [orderId, userId]
    );
    return result.rows[0];
  }

  async updateAmount(client: any, orderId: number, amount: number) {
    await client.query(`UPDATE "order" SET amount = $1 WHERE id = $2`, [
      amount,
      orderId,
    ]);
  }

  async updateStatus(orderId: number, status: string) {
    const result = await db.query(
      `UPDATE "order" SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
      [status, orderId]
    );
    return result.rows[0];
  }

  async findByUser(userId: number) {
    const result = await db.query(
      `SELECT * FROM "order" WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows[0];
  }

  async getWithItems(orderId: number) {
    const order = await db.query(`SELECT * FROM "order" WHERE id = $1`, [
      orderId,
    ]);

    if (!order.rows.length) {
      return null;
    }

    const items = await db.query(
      `SELECT oi.product_id as id, oi.quantity, oi.price, p.name as product_name, p.photo as product_photo
       FROM order_item oi
       JOIN product p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    return { ...order.rows[0], items: items.rows };
  }

  async getAllOrderIdsByUser(client: any, userId: number) {
    const result = await client.query(
      `SELECT id FROM "order" WHERE user_id = $1`,
      [userId]
    );
    return result.rows.map((row) => row.id);
  }

  async deleteAllByUser(userId: number) {
    const result = await db.query(
      `DELETE FROM "order" WHERE user_id = $1 RETURNING id`,
      [userId]
    );
    return result.rows.map((row) => row.id);
  }
}

export default new OrderRepository();
