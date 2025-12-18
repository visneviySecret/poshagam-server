import { Router } from "express";
import orderController from "../controller/order.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/create", authMiddleware, (req, res) =>
  orderController.create(req, res)
);
router.put("/:id", authMiddleware, (req, res) =>
  orderController.update(req, res)
);
router.get("/", authMiddleware, (req, res) =>
  orderController.getMyOrders(req, res)
);
router.get("/:id", authMiddleware, (req, res) =>
  orderController.getById(req, res)
);
router.patch("/:id/status", authMiddleware, (req, res) =>
  orderController.updateStatus(req, res)
);

router.delete("/", authMiddleware, (req, res) =>
  orderController.deleteAll(req, res)
);

export default router;
