import type { RequestHandler } from "express";
import { jwtService } from "./jwt.service.js";
import { AppError } from "../../utils/AppError.js";
import { UserRole } from "../users/user.types.js";
import { UserModel } from "../users/user.model.js";

export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next(new AppError(401, "AUTH_REQUIRED", "Authentication is required"));

  const token = header.slice(7).trim();
  if (!token) return next(new AppError(401, "AUTH_REQUIRED", "Authentication is required"));

  try {
    const payload = jwtService.verifyAccessToken(token);
    const user = await UserModel.findById(payload.sub).select("email role isActive passwordChangedAt").lean();
    if (!user || !user.isActive) return next(new AppError(401, "INVALID_SESSION", "User session is no longer valid"));

    req.auth = {
      userId: payload.sub,
      email: user.email,
      role: user.role as UserRole,
    };
    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(new AppError(401, "INVALID_ACCESS_TOKEN", "Access token is invalid or expired"));
  }
};

export const requireRole = (...roles: UserRole[]): RequestHandler => (req, _res, next) => {
  if (!req.auth) return next(new AppError(401, "AUTH_REQUIRED", "Authentication is required"));
  if (!roles.includes(req.auth.role)) return next(new AppError(403, "FORBIDDEN", "You do not have permission to perform this action"));
  next();
};
