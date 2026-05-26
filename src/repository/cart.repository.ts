import { Pool, PoolClient } from "pg";
import db from "../database/database";

class CartRepository {
  async create(client: PoolClient, userId: number, status: string) {
    const result = await client.query(
      `INSERT INTO cart (user_id, status, amount) 
       VALUES ($1, $2, 0) RETURNING *`,
      [userId, status]
    );
    return result.rows[0];
  }

  async findById(client: PoolClient, cartId: number) {
    const result = await client.query(`SELECT * FROM cart WHERE id = $1`, [
      cartId,
    ]);
    return result.rows[0];
  }

  async findByIdAndUser(
    client: PoolClient | Pool,
    cartId: number,
    userId: number
  ) {
    const result = await client.query(
      `SELECT * FROM cart WHERE id = $1 AND user_id = $2`,
      [cartId, userId]
    );
    return result.rows[0];
  }

  async updateAmount(client: PoolClient, cartId: number, amount: number) {
    await client.query(`UPDATE cart SET amount = $1 WHERE id = $2`, [
      amount,
      cartId,
    ]);
  }

  async updateStatus(cartId: number, status: string) {
    const result = await db.query(
      `UPDATE cart SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
      [status, cartId]
    );
    return result.rows[0];
  }

  async findPendingByUser(userId: number) {
    const result = await db.query(
      `SELECT * FROM cart WHERE user_id = $1 AND status = 'pending' ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    return result.rows[0];
  }

  async getWithItems(id: number, clientProp?: PoolClient) {
    const isClient = clientProp !== undefined;
    const client = isClient ? clientProp : db;

    const cart = await client.query(`SELECT * FROM cart WHERE id = $1`, [id]);

    if (!cart.rows.length) {
      return null;
    }

    const items = await client.query(
      `SELECT oi.product_id as id, oi.quantity, oi.price, p.name as product_name, p.images as product_images
       FROM cart_item oi
       JOIN product p ON oi.product_id = p.id
       WHERE oi.cart_id = $1`,
      [id]
    );

    return { ...cart.rows[0], items: items.rows };
  }

  async deleteAllPendingByUser(userId: number) {
    const result = await db.query(
      `DELETE FROM cart WHERE user_id = $1 AND status = 'pending' RETURNING id`,
      [userId]
    );
    return result.rows.map((row) => row.id);
  }
}

export default new CartRepository();
