import cartService from "../service/cart.service";

class CartController {
  async create(req, res) {
    try {
      const userId = req.user.id;
      const { items, status } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Items are required" });
      }

      const cart = await cartService.createCart(userId, { items, status });
      res.status(201).json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { items } = req.body;

      const cart = await cartService.updateCart(Number(id), userId, { items });
      res.status(200).json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const cart = await cartService.getCartById(Number(id));

      if (cart.user_id !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.status(200).json(cart);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async getMyCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await cartService.getCartByUser(userId);
      res.status(200).json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const cart = await cartService.updateCartStatus(Number(id), status);
      res.status(200).json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async clear(req, res) {
    try {
      const userId = req.user.id;
      const result = await cartService.clearUserCarts(userId);
      res.status(200).json({
        message: `Cleared ${result.deletedCount} cart`,
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new CartController();
