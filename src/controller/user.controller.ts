import db from "../database/database";
import UserService from "../service/user.service";

class UserController {
  async signup(req, res) {
    try {
      const { email, password } = req.body;
      const newUser = await UserService.signup(email, password);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await UserService.login(email, password);
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      await UserService.logout(refreshToken);
      res.status(200).json({ message: "Logged out" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const user = await UserService.refreshToken(refreshToken);
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  async getUsers(req, res) {
    const query = `SELECT id, email FROM "user"`;
    const users = await db.query(query);
    res.status(200).json(users.rows);
  }
}

export default new UserController();
