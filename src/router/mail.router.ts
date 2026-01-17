import { Router } from "express";
import mailController from "../controller/mail.controller";

const router = Router();

router.post("/send", (req, res) =>
  mailController.sendMailWithInstruction(req, res)
);

export default router;
