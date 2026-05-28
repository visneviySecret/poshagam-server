import productService from "../service/product.service";
import S3Service from "../service/s3.service";

class ProductController {
  async createProduct(req, res) {
    try {
      const { name, price, description, category } = req.body;
      let imagesUrl: string[] = [];
      let previewUrl: string = "";
      let instructionUrl: string = "";
      const userId = req.user.id;

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
        owner: userId,
      });

      res.status(201).json(product);
    } catch (error) {
      const status = error?.statusCode || 400;
      res.status(status).json({ message: error?.message });
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

  async getProductsByOwner(req, res) {
    try {
      const owner = req.user.id;
      const products = await productService.getOwnerProducts(owner);
      res.status(200).json(products);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const products = await productService.deleteProductById(id);
      res
        .status(200)
        .json({ message: "Successfully deleted: " + id, products });
    } catch (error) {
      const status = error.statusCode || 400;
      res.status(status).json({ message: error.message });
    }
  }

  async getProductForEdit(req, res) {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;

      const ownerProducts = await productService.getOwnerProducts(ownerId);
      const ownerProduct = ownerProducts.find(
        (product) => product.id === Number(id)
      );

      if (!ownerProduct) {
        return res.status(403).json({ message: "Не ваш товар" });
      }
      res.status(200).json(ownerProduct);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async patchProduct(req, res) {
    try {
      const { id } = req.params;
      const updates = await req.body;
      const keys = Object.keys(updates);

      const setParts = keys.map((key, i) => `"${key}" = $${i + 1}`);
      const values = Object.values(updates);

      const products = await productService.editProductById(
        id,
        setParts,
        values
      );
      res.status(200).json({ message: "Successfully edit: " + id, products });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new ProductController();
