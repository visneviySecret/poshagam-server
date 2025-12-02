import { Router } from "express";
import UserController from "../controller/user.controller";

const router = Router();

router.post("/", UserController.createUser);
router.get("/", UserController.getUsers);
router.get("/:id", UserController.getUser);
export default router;
