import db from "../database/database";

class ProductService {
  async createProduct(product: any) {
    const newProduct = await db.query(
      `INSERT INTO product (name, price, description, photo,  remaining) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        product.name,
        product.price,
        product.description,
        product.photo,
        product.remaining,
      ]
    );
    return newProduct.rows[0];
  }
  async getProducts() {
    const products = await db.query(`SELECT * FROM product`);
    return products.rows;
  }
}

export default new ProductService();
