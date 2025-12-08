import db from "../database/database";

class ProductStockService {
  async validateAndGetProduct(
    client: any,
    productId: number,
    quantity: number
  ) {
    const product = await client.query(`SELECT * FROM product WHERE id = $1`, [
      productId,
    ]);

    if (!product.rows.length) {
      throw new Error(`Product with id ${productId} not found`);
    }

    if (product.rows[0].remaining < quantity) {
      throw new Error(
        `Insufficient stock for product ${productId}. Available: ${product.rows[0].remaining}, Requested: ${quantity}`
      );
    }

    return product.rows[0];
  }

  async decreaseStock(client: any, productId: number, quantity: number) {
    await client.query(
      `UPDATE product SET remaining = remaining - $1 WHERE id = $2`,
      [quantity, productId]
    );
  }

  async increaseStock(client: any, productId: number, quantity: number) {
    await client.query(
      `UPDATE product SET remaining = remaining + $1 WHERE id = $2`,
      [quantity, productId]
    );
  }
}

export default new ProductStockService();
