import jwt from "jsonwebtoken";
import db from "../database/database";

const JWT_SECRET_ACCESS = process.env.JWT_SECRET_ACCESS;
const JWT_SECRET_REFRESH = process.env.JWT_SECRET_REFRESH;
const EXPIRES_IN_ACCESS = "1h";
const EXPIRES_IN_REFRESH = "7d";

if (!JWT_SECRET_ACCESS || !JWT_SECRET_REFRESH) {
  throw new Error(
    "JWT_SECRET_ACCESS and JWT_SECRET_REFRESH must be set in environment variables"
  );
}

class TokenService {
  generateToken(payload: any) {
    const accessToken = jwt.sign(payload, JWT_SECRET_ACCESS!, {
      expiresIn: EXPIRES_IN_ACCESS,
    });
    const refreshToken = jwt.sign(payload, JWT_SECRET_REFRESH!, {
      expiresIn: EXPIRES_IN_REFRESH,
    });
    return { accessToken, refreshToken };
  }

  async saveToken(userId: string, refreshToken: string) {
    const token = await db.query(
      `SELECT refresh_token FROM token WHERE user_id = $1`,
      [userId]
    );
    if (token.rows.length) {
      await db.query(`UPDATE token SET refresh_token = $1 WHERE user_id = $2`, [
        refreshToken,
        userId,
      ]);
    } else {
      await db.query(
        `INSERT INTO token (user_id, refresh_token) VALUES ($1, $2)`,
        [userId, refreshToken]
      );
    }
  }
  async removeToken(refreshToken: string) {
    await db.query(`DELETE FROM token WHERE refresh_token = $1`, [
      refreshToken,
    ]);
  }
  async findToken(refreshToken: string) {
    const token = await db.query(
      `SELECT * FROM token WHERE refresh_token = $1`,
      [refreshToken]
    );
    return token.rows[0];
  }
  async verifyAccessToken(token: string) {
    return jwt.verify(token, JWT_SECRET_ACCESS!);
  }
  async verifyRefreshToken(token: string) {
    return jwt.verify(token, JWT_SECRET_REFRESH!);
  }
}

export default new TokenService();
