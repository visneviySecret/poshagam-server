import { Router } from "express";
import UserRouter from "./user.router";
import ProductRouter from "./product.router";
import AddressRouter from "./address.router";
import OrderRouter from "./order.router";
import PaymentRouter from "./payment.router";
import MailRouter from "./mail.router";
import S3ProxyRouter from "./s3-proxy.router";

const router = Router();

router.use("/s3-proxy", S3ProxyRouter);
router.use("/users", UserRouter);
router.use("/products", ProductRouter);
router.use("/addresses", AddressRouter);
router.use("/order", OrderRouter);
router.use("/payment", PaymentRouter);
router.use("/mail", MailRouter);

export default router;
