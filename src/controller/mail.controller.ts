import mailService from "../service/mail.service";
import { Request, Response } from "express";

class MailController {
  async sendMailWithInstruction(req: Request, res: Response) {
    try {
      await mailService.sendMail(
        "egor.belousov.frontend@gmail.com",
        "Барабанщик"
      );
      res.status(200).json({ message: "Инструкция отправлена" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new MailController();
