import db from "../database/database";
import S3Service from "./s3.service";

interface Product {
  name: string;
  description: string;
  price: number;
  category: number;
  images: string[];
  preview: string;
  instruction: string;
}

class ProductService {
  async createProduct(product: Product) {
    const imagesJson = JSON.stringify(product.images);
    const newProduct = await db.query(
      `INSERT INTO product (name, price, description, images, category_id, preview, instruction) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        product.name,
        product.price,
        product.description,
        imagesJson,
        product.category,
        product.preview,
        product.instruction,
      ]
    );
    return newProduct.rows[0];
  }

  async getProducts() {
    const products = await db.query(
      `SELECT id, name, price, description, images, category_id, preview FROM product`
    );

    const productsWithUrls = await Promise.all(
      products.rows.map(async (product) => {
        let parsedImages = [];
        try {
          parsedImages = JSON.parse(product.images || "[]");
        } catch (error) {
          parsedImages = [];
        }

        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          const imagesUrls = await Promise.all(
            parsedImages.map(async (imageKey: string) => {
              return await S3Service.getFileUrl(imageKey);
            })
          );
          const previewUrl = await S3Service.getFileUrl(product.preview);

          return {
            ...product,
            images: imagesUrls,
            preview: previewUrl,
          };
        }

        return { ...product, images: [] };
      })
    );

    return productsWithUrls;
  }
}

export default new ProductService();
