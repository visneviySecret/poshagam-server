import { Router } from "express";
import AddressController from "../controller/address.controller";

const router = Router();

router.post("/", (req, res) => AddressController.create(req, res));
router.get("/user/:userId", (req, res) =>
  AddressController.getByUser(req, res)
);
router.put("/:id", (req, res) => AddressController.update(req, res));
router.delete("/:id", (req, res) => AddressController.delete(req, res));

export default router;
