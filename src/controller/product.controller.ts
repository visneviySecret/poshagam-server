import productService from "../service/product.service";
import S3Service from "../service/s3.service";

class ProductController {
  async createProduct(req, res) {
    try {
      const { name, price, description, category } = req.body;
      let imagesUrl: string[] = [];
      let previewUrl: string = "";
      let instructionUrl: string = "";

      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const imageFiles = [];
        let previewFile: Express.Multer.File;
        let instructionFile: Express.Multer.File;
        req.files.forEach((file: Express.Multer.File) => {
          if (file.fieldname.includes("images")) {
            imageFiles.push(file);
          }
          if (file.fieldname.includes("preview")) {
            previewFile = file;
          }
          if (file.fieldname.includes("instruction")) {
            instructionFile = file;
          }
        });
        imagesUrl = await Promise.all(
          imageFiles.map(async (file: Express.Multer.File) => {
            return await S3Service.uploadFile(file);
          })
        );
        previewUrl = await S3Service.uploadFile(previewFile);
        instructionUrl = await S3Service.uploadFile(instructionFile);
      }

      const product = await productService.createProduct({
        name,
        description,
        price: parseFloat(price),
        category: parseInt(category),
        images: imagesUrl,
        preview: previewUrl,
        instruction: instructionUrl,
      });

      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
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
