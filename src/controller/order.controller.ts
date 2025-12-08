import orderService from "../service/order.service";

class OrderController {
  async create(req, res) {
    try {
      const userId = req.user.id;
      const { items, status } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Items are required" });
      }

      const order = await orderService.createOrder(userId, { items, status });
      console.log("order", order);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Items are required" });
      }

      const order = await orderService.updateOrder(Number(id), userId, {
        items,
      });
      res.status(200).json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(Number(id));

      if (order.user_id !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.status(200).json(order);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async getMyOrders(req, res) {
    try {
      const userId = req.user.id;
      const orders = await orderService.getOrdersByUser(userId);
      res.status(200).json(orders);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(Number(id), status);
      res.status(200).json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new OrderController();
