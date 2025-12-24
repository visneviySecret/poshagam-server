import paymentService from "../service/payment.service";
import orderService from "../service/order.service";
import orderRepository from "../repository/order.repository";
import db from "../database/database";

class PaymentController {
  async createPayment(req, res) {
    try {
      const { orderId, items } = req.body;
      const userId = (req as any).user.id;

      let order;

      if (orderId) {
        order = await orderRepository.findByIdAndUser(db, orderId, userId);

        if (!order) {
          return res.status(404).json({ message: "Order not found" });
        }

        if (order.status === "paid") {
          return res.status(400).json({ message: "Order already paid" });
        }
      } else {
        if (!items || !Array.isArray(items) || items.length === 0) {
          return res
            .status(400)
            .json({ message: "Items are required to create order" });
        }

        order = await orderService.createOrder(userId, {
          items: items,
          status: "pending",
        });
      }

      const paymentUrl = paymentService.getPaymentUrl(
        order.id,
        order.amount,
        `Order #${order.id}`
      );

      res.status(200).json({ paymentUrl, orderId: order.id });
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

      await orderRepository.updateStatus(parseInt(InvId), "paid");

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

      await orderRepository.updateStatus(parseInt(InvId as string), "failed");

      res.redirect(`${process.env.CLIENT_URL}/order/${InvId}/failed`);
    } catch (error) {
      console.error("Error handling payment fail:", error);
      res.redirect(`${process.env.CLIENT_URL}/order/error`);
    }
  }
}

export default new PaymentController();
