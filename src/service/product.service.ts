import db from "../database/database";

interface Product {
  name: string;
  price: number;
  description: string;
  photo: string;
  remaining: number;
}

class ProductService {
  async createProduct(product: Product) {
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
