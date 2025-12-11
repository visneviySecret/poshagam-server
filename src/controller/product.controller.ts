import productService from "../service/product.service";
import S3Service from "../service/s3.service";

class ProductController {
  async createProduct(req, res) {
    try {
      const { name, price, description, remaining } = req.body;
      let photoUrl = "";

      if (req.file) {
        photoUrl = await S3Service.uploadFile(req.file);
      }

      const product = await productService.createProduct({
        name,
        price: parseFloat(price),
        description,
        photo: photoUrl,
        remaining: parseInt(remaining),
      });

      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getProducts(req, res) {
    try {
      const products = await productService.getProducts();
      res.status(200).json(products);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new ProductController();
