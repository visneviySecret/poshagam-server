import { Product } from "../types/global";
import db from "../database/database";
import { PoolClient, Pool } from "pg";

class ProductStockService {
  async validateAndGetProduct(
    productId: number,
    client?: PoolClient | Pool
  ): Promise<Product> {
    client = client || db;
    const product = await client.query(`SELECT * FROM product WHERE id = $1`, [
      productId,
    ]);

    if (!product.rows.length) {
      throw new Error(`Product with id ${productId} not found`);
    }

    return product.rows[0];
  }
}

export default new ProductStockService();
