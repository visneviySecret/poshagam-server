import db from "../database/database";
import S3Service from "./s3.service";

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
    const products = await db.query(
      `SELECT id, name, price, description, photo, remaining FROM product`
    );

    const productsWithUrls = await Promise.all(
      products.rows.map(async (product) => {
        if (product.photo && product.photo.includes(".blob")) {
          const photoUrl = await S3Service.getFileUrl(product.photo);
          return { ...product, photo: photoUrl };
        }
        return product;
      })
    );

    return productsWithUrls;
  }
}

export default new ProductService();
