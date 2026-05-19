import { Router } from "express";
import productController from "../controller/product.controller";
import { upload } from "../middleware/upload.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/create",
  authMiddleware,
  upload.any(),
  productController.createProduct
);
router.get("/", productController.getProducts);
router.get("/owner", authMiddleware, productController.getProductsByOwner);
router.get("/edit/:id", authMiddleware, productController.getProductForEdit);
router.patch("/edit/:id", authMiddleware, productController.patchProduct);
router.delete("/:id", authMiddleware, productController.deleteProduct);

export default router;
