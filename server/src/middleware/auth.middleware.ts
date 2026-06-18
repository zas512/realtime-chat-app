import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    const decoded = verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
