import { Request, Response } from "express";
import productStockService from "../service/product-stock.service";
import { sendInstructionEmail } from "../helpers/mail.helper";

class MailController {
  async sendMailWithInstruction(req: Request, res: Response) {
    try {
      const email = req.body.email;
      const product = await productStockService.validateAndGetProduct(3);

      await sendInstructionEmail(email, product);

      res.status(200).json({ message: "Инструкция отправлена" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new MailController();
