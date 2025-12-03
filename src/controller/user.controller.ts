import db from "../database/database";
import UserService from "../service/user.service";
import TokenService from "../service/token.service";
import AddressService from "../service/address.service";

class UserController {
  async signup(req, res) {
    try {
      const { email, password } = req.body;
      const newUser = await UserService.signup(email, password);

      res.cookie("accessToken", newUser.tokens.accessToken, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await UserService.login(email, password);

      res.cookie("accessToken", user.tokens.accessToken, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async logout(req, res) {
    try {
      const { refreshToken } = req.cookies;
      if (refreshToken) {
        await UserService.logout(refreshToken);
      }
      res.clearCookie("accessToken");
      res.status(200).json({ message: "Logged out" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token missing" });
      }
      const user = await UserService.refreshToken(refreshToken);

      res.cookie("accessToken", user.tokens.accessToken, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res.status(200).json({
        user: { id: user.id, email: user.email },
        accessToken: user.tokens.accessToken,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getUsers(req, res) {
    const query = `SELECT id, email FROM "user"`;
    const users = await db.query(query);
    res.status(200).json(users.rows);
  }

  async getMe(req, res) {
    try {
      const token = req.cookies.accessToken;
      if (!token) {
        return res.status(401).json({ message: "Token missing" });
      }
      const decoded = await TokenService.verifyAccessToken(token);
      if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
        return res.status(401).json({ message: "Invalid token" });
      }
      const user = await UserService.getMe(decoded.id);
      const userAddresses = await AddressService.getAddressesByUser(decoded.id);
      res.status(200).json({ ...user, addresses: userAddresses });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

export default new UserController();
