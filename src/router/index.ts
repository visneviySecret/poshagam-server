import { Router } from "express";
import UserRouter from "./user.router";
import ProductRouter from "./product.router";
import AddressRouter from "./address.router";
import CartRouter from "./cart.router";
import PaymentRouter from "./payment.router";
import MailRouter from "./mail.router";

const router = Router();

router.use("/users", UserRouter);
router.use("/products", ProductRouter);
router.use("/addresses", AddressRouter);
router.use("/cart", CartRouter);
router.use("/payment", PaymentRouter);
router.use("/mail", MailRouter);

export default router;
