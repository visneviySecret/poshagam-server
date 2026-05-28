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
  owner: number;
}

class ProductService {
  async createProduct(product: Product) {
    const imagesJson = JSON.stringify(product.images);
    const newProduct = await db.query(
      `INSERT INTO product (name, price, description, images, category_id, preview, instruction, owner) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        product.name,
        product.price,
        product.description,
        imagesJson,
        product.category,
        product.preview,
        product.instruction,
        product.owner,
      ]
    );
    return newProduct.rows[0];
  }

  async getProducts() {
    const products = await db.query(
      `SELECT id, name, price, description, images, category_id, preview FROM product`
    );

    return await this.appendFilesToProducts(products.rows);
  }

  async getProductById(id: string) {
    const products = await db.query(
      `SELECT id, name, price, description, images, category_id, preview FROM product WHERE id = $1`,
      [id]
    );

    return await this.appendFilesToProducts(products.rows);
  }

  async getOwnerProducts(owner: string) {
    const products = await db.query(
      `SELECT id, name, price, description, images, category_id, preview, instruction FROM product WHERE owner = $1`,
      [owner]
    );
    return await this.appendFilesToProducts(products.rows);
  }

  async appendFilesToProducts(products) {
    const productsWithUrls = await Promise.all(
      products.map(async (product) => {
        let parsedImages = [];
        try {
          parsedImages = JSON.parse(product.images || "[]");
        } catch (error) {
          parsedImages = [];
        }

        const imageKeys: string[] = Array.isArray(parsedImages)
          ? parsedImages.filter(Boolean)
          : [];

        const imagesUrls = await Promise.all(
          imageKeys.map(async (imageKey: string) => {
            return await S3Service.getFileUrl(imageKey);
          })
        );

        const previewUrl = product.preview
          ? await S3Service.getFileUrl(product.preview)
          : null;

        const instructionUrl = product.instruction
          ? await S3Service.getFileUrl(product.instruction)
          : null;

        return {
          ...product,
          images: imagesUrls,
          preview: previewUrl,
          instruction: instructionUrl,
        };
      })
    );

    return productsWithUrls;
  }

  collectProductFileKeys(product: {
    images?: string | string[];
    preview?: string;
    instruction?: string;
  }): string[] {
    const keys: string[] = [];

    if (product.preview) keys.push(product.preview);
    if (product.instruction) keys.push(product.instruction);

    let parsedImages: string[] = [];
    if (typeof product.images === "string") {
      try {
        parsedImages = JSON.parse(product.images || "[]");
      } catch {
        parsedImages = [];
      }
    } else if (Array.isArray(product.images)) {
      parsedImages = product.images;
    }

    if (Array.isArray(parsedImages)) {
      keys.push(...parsedImages.filter(Boolean));
    }

    return Array.from(new Set(keys));
  }

  async deleteProductById(id) {
    const existing = await db.query("SELECT * FROM product WHERE id = $1", [
      id,
    ]);
    if (existing.rows.length === 0) return [];

    const inOrders = await db.query(
      "SELECT 1 FROM cart_item WHERE product_id = $1 LIMIT 1",
      [id]
    );
    if (inOrders.rows.length > 0) {
      const error = new Error(
        "Товар нельзя удалить: он участвует в заказах"
      ) as Error & { statusCode?: number };
      error.statusCode = 409;
      throw error;
    }

    await db.query("DELETE FROM review WHERE product_id = $1", [id]);
    await S3Service.deleteFiles(this.collectProductFileKeys(existing.rows[0]));

    const products = await db.query(
      "DELETE FROM product WHERE id = $1 RETURNING *",
      [id]
    );
    return products.rows;
  }

  async editProductById(id, setParts, values) {
    const products = await db.query(
      `UPDATE product SET ${setParts.join(", ")} WHERE id = $${
        values.length + 1
      } RETURNING *`,
      [...values, id]
    );
    return products.rows;
  }
}

export default new ProductService();
