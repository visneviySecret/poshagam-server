import { Router } from "express";
import UserRouter from "./user.router";
import ProductRouter from "./product.router";

const router = Router();

router.use("/users", UserRouter);
router.use("/products", ProductRouter);

export default router;
