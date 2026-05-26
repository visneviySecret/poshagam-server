import paymentService from "../service/payment.service";
import cartService from "../service/cart.service";
import cartRepository from "../repository/cart.repository";
import db from "../database/database";

class PaymentController {
  async createPayment(req, res) {
    try {
      const { cartId, orderId, items } = req.body;
      const resolvedCartId = cartId ?? orderId;
      const userId = (req as any).user.id;

      let cart;

      if (resolvedCartId) {
        cart = await cartRepository.findByIdAndUser(db, resolvedCartId, userId);

        if (!cart) {
          return res.status(404).json({ message: "Cart not found" });
        }

        if (cart.status === "paid") {
          return res.status(400).json({ message: "Cart already paid" });
        }
      } else {
        if (!items || !Array.isArray(items) || items.length === 0) {
          return res
            .status(400)
            .json({ message: "Items are required to create cart" });
        }

        cart = await cartService.createCart(userId, {
          items,
          status: "pending",
        });
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

      await cartRepository.updateStatus(parseInt(InvId), "paid");

      res.status(200).send(`OK${InvId}`);
    } catch (error) {
      console.error("Error handling payment result:", error);
      res.status(400).json({ message: error.message });
    }
  }

  async handleSuccess(req, res) {
    try {
      const { OutSum, InvId, SignatureValue } = req.query;

      const isValid = paymentService.verifyResultSignature(
        OutSum as string,
        InvId as string,
        SignatureValue as string
      );

      if (!isValid) {
        return res.status(400).send("Invalid signature");
      }

      res.redirect(`${process.env.CLIENT_URL}/order/${InvId}/success`);
    } catch (error) {
      console.error("Error handling payment success:", error);
      res.redirect(`${process.env.CLIENT_URL}/order/error`);
    }
  }

  async handleFail(req, res) {
    try {
      const { InvId } = req.query;

      await cartRepository.updateStatus(parseInt(InvId as string), "failed");

      res.redirect(`${process.env.CLIENT_URL}/order/${InvId}/failed`);
    } catch (error) {
      console.error("Error handling payment fail:", error);
      res.redirect(`${process.env.CLIENT_URL}/order/error`);
    }
  }
}

export default new PaymentController();
