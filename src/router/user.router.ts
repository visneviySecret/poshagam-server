import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import UserController from "../controller/user.controller";

const router = Router();

router.post("/signup", UserController.signup);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);
router.get("/refresh-token", UserController.refreshToken);
router.get("/", UserController.getUsers);
router.get("/me", authMiddleware, UserController.getMe);
router.post("/set-role", authMiddleware, UserController.setRole);

export default router;
