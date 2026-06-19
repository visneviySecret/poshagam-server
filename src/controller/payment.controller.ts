import paymentService from "../service/payment.service";
import cartService from "../service/cart.service";
import cartRepository from "../repository/cart.repository";
import { sendInstructionsForCart } from "../helpers/mail.helper";

class PaymentController {
  async createPayment(req, res) {
    try {
      const userId = req.user.id;
      const cart = await cartService.getCartByUser(userId);

      if (!cart || !cart.items?.length) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      if (cart.status === "paid") {
        return res.status(400).json({ message: "Cart already paid" });
      }

      const paymentUrl = paymentService.getPaymentUrl(
        cart.id,
        cart.amount,
        `Order #${cart.id}`
      );

      res.status(200).json({ paymentUrl, cartId: cart.id, orderId: cart.id });
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(400).json({ message: error.message });
    }
  }

  async handleResult(req, res) {
    try {
      const { OutSum, InvId, SignatureValue } = req.body;

      const isValid = paymentService.verifyResultSignature(
        OutSum,
        InvId,
        SignatureValue
      );

      if (!isValid) {
        return res.status(400).send("Invalid signature");
      }

      const cartId = parseInt(InvId, 10);
      const cart = await cartRepository.findById(cartId);

      if (!cart) {
        return res.status(404).send("Cart not found");
      }

      if (cart.status === "paid") {
        return res.status(200).send(`OK${InvId}`);
      }

      try {
        await sendInstructionsForCart(cartId);
      } catch (emailError) {
        console.error("Instruction email error:", emailError);
      }

      await cartRepository.updateStatus(cartId, "paid");

      res.status(200).send(`OK${InvId}`);
    } catch (error) {
      console.error("Error handling payment result:", error);
      res.status(400).json({ message: error.message });
    }
  }

  async handleSuccess(req, res) {
    try {
      const { OutSum, InvId, SignatureValue } = req.query;

      const isValid = paymentService.verifySuccessSignature(
        OutSum as string,
        InvId as string,
        SignatureValue as string
      );

      if (!isValid) {
        return res.redirect(`${process.env.CLIENT_URL}/fail?cartId=${InvId}`);
      }

      res.redirect(`${process.env.CLIENT_URL}/success?cartId=${InvId}`);
    } catch (error) {
      console.error("Error handling payment success:", error);
      res.redirect(`${process.env.CLIENT_URL}/fail`);
    }
  }

  async handleFail(req, res) {
    try {
      const { InvId } = req.query;

      await cartRepository.updateStatus(parseInt(InvId as string), "failed");

      res.redirect(`${process.env.CLIENT_URL}/fail?cartId=${InvId}`);
    } catch (error) {
      console.error("Error handling payment fail:", error);
      res.redirect(`${process.env.CLIENT_URL}/fail`);
    }
  }
}

export default new PaymentController();
