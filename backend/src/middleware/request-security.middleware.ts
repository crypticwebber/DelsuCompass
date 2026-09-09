import crypto from "node:crypto";
import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError.js";

const FORBIDDEN_KEY = /(^\$)|\./;

function inspect(value: unknown, depth = 0): void {
  if (depth > 20) throw new AppError(400, "REQUEST_TOO_DEEP", "Request payload is too deeply nested");
  if (Array.isArray(value)) {
    for (const item of value) inspect(item, depth + 1);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_KEY.test(key)) {
      throw new AppError(400, "UNSAFE_REQUEST_KEY", "Request contains a prohibited field name");
    }
    inspect(child, depth + 1);
  }
}

export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const incoming = req.header("x-request-id")?.trim();
  const requestId = incoming && /^[A-Za-z0-9_-]{8,80}$/.test(incoming) ? incoming : crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
};

export const rejectNoSqlOperatorInjection: RequestHandler = (req, _res, next) => {
  try {
    inspect(req.body);
    inspect(req.query);
    inspect(req.params);
    next();
  } catch (error) {
    next(error);
  }
};

export const noStoreSensitiveResponses: RequestHandler = (req, res, next) => {
  if (req.path.startsWith("/api/v1/auth") || req.path.startsWith("/api/v1/budget")) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
  }
  next();
};
