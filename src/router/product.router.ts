import { Router } from "express";
import productController from "../controller/product.controller";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.post("/", upload.single("photo"), productController.createProduct);
router.get("/", productController.getProducts);

export default router;
