import { Router } from "express";
import paymentController from "../controller/payment.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/create", authMiddleware, paymentController.createPayment);
router.post("/result", paymentController.handleResult);
router.get("/success", paymentController.handleSuccess);
router.get("/fail", paymentController.handleFail);

export default router;
