import { Router } from "express";
import cartController from "../controller/cart.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/create", authMiddleware, (req, res) =>
  cartController.create(req, res)
);
router.put("/:id", authMiddleware, (req, res) =>
  cartController.update(req, res)
);
router.get("/", authMiddleware, (req, res) =>
  cartController.getMyCart(req, res)
);
router.get("/:id", authMiddleware, (req, res) =>
  cartController.getById(req, res)
);
router.patch("/:id/status", authMiddleware, (req, res) =>
  cartController.updateStatus(req, res)
);
router.delete("/", authMiddleware, (req, res) =>
  cartController.clear(req, res)
);

export default router;
