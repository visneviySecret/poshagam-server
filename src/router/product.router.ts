import { Router } from "express";
import { uploadAny } from "../middleware/upload.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import productController from "../controller/product.controller";
import categoryController from "../controller/category.controller";

const router = Router();

router.post(
  "/create",
  authMiddleware,
  uploadAny,
  productController.createProduct
);
router.get("/", productController.getProducts);
router.get("/owner", authMiddleware, productController.getProductsByOwner);
router.get("/categories", authMiddleware, categoryController.getCategories);
router.patch(
  "/categories/:id",
  authMiddleware,
  categoryController.editCategory
);
router.get("/edit/:id", authMiddleware, productController.getProductForEdit);
router.patch("/edit/:id", authMiddleware, productController.patchProduct);
router.get("/:id", productController.getPublicProduct);
router.delete("/:id", authMiddleware, productController.deleteProduct);

export default router;
