import { Router } from "express";
import UserController from "../controller/user.controller";

const router = Router();

router.post("/signup", UserController.signup);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);
router.post("/refresh-token", UserController.refreshToken);
router.get("/", UserController.getUsers);
export default router;
