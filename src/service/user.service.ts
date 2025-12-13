import db from "../database/database";
import bcrypt from "bcrypt";
import TokenService from "./token.service";

class UserService {
  async signup(email: string, password: string) {
    const candidate = await db.query(`SELECT * FROM "user" WHERE email = $1`, [
      email,
    ]);
    if (candidate.rows.length) {
      throw new Error("User already exists");
    }
    const hashPassword = await bcrypt.hash(password, 7);
    const newUser = await db.query(
      `INSERT INTO "user" (email, password, role) VALUES ($1, $2, 'user') RETURNING *`,
      [email, hashPassword]
    );
    const tokens = TokenService.generateToken(newUser.rows[0]);
    await TokenService.saveToken(newUser.rows[0].id, tokens.refreshToken);
    return { ...newUser.rows[0], tokens };
  }

  async login(email: string, password: string) {
    const user = await db.query(`SELECT * FROM "user" WHERE email = $1`, [
      email,
    ]);
    if (!user.rows.length) {
      throw new Error("User not found");
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.rows[0].password
    );
    if (!isPasswordCorrect) {
      throw new Error("Invalid password");
    }
    const tokens = TokenService.generateToken(user.rows[0]);
    await TokenService.saveToken(user.rows[0].id, tokens.refreshToken);
    return { ...user.rows[0], tokens };
  }

  async logout(refreshToken: string) {
    await TokenService.removeToken(refreshToken);
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }
    const decoded = await TokenService.verifyRefreshToken(refreshToken);
    const tokenFromDb = await TokenService.findToken(refreshToken);
    if (
      !decoded ||
      !tokenFromDb ||
      typeof decoded !== "object" ||
      !("id" in decoded)
    ) {
      throw new Error("Invalid refresh token");
    }
    const user = await db.query(`SELECT * FROM "user" WHERE id = $1`, [
      decoded.id,
    ]);
    const tokens = TokenService.generateToken(user.rows[0]);
    await TokenService.saveToken(user.rows[0].id, tokens.refreshToken);
    return { ...user.rows[0], tokens };
  }

  async getMe(userId: string) {
    const user = await db.query(`SELECT * FROM "user" WHERE id = $1`, [userId]);
    if (!user.rows.length) {
      throw new Error("User not found");
    }
    return user.rows[0];
  }

  async setRole(userId: string, role: "user" | "admin") {
    const user = await db.query(
      `UPDATE "user" SET role = $1 WHERE id = $2 RETURNING *`,
      [role, userId]
    );
    if (!user.rows.length) {
      throw new Error("User not found");
    }
    return user.rows[0];
  }
}

export default new UserService();
