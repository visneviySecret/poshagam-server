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

    return product.rows[0];
  }
}

export default new ProductStockService();
