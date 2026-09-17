import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../lib/AppError";

export interface AuthedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.lifehub_token;
  if (!token) {
    return next(new AppError(401, "Not authenticated"));
  }
  try {
    const secret = process.env.JWT_SECRET as string;
    const payload = jwt.verify(token, secret) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    next(new AppError(401, "Invalid or expired session"));
  }
}
