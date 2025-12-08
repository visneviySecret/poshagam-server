import { Request, Response, NextFunction } from "express";
import TokenService from "../service/token.service";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    const decoded = await TokenService.verifyAccessToken(token);
    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      return res.status(401).json({ message: "Invalid token" });
    }

    (req as any).user = { id: decoded.id, email: decoded.email };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
