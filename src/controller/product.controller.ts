import productService from "../service/product.service";

class ProductController {
  async createProduct(req, res) {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  }
  async getProducts(req, res) {
    const products = await productService.getProducts();
    res.status(200).json(products);
  }
}

export default new ProductController();
