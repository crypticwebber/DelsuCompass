import type { Request } from "express";
import { AppError } from "../../utils/AppError.js";

export function sessionCookieName(req: Request) {
  const id = req.get("X-Session-Id");
  if (
    !id ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    )
  ) {
    throw new AppError(
      401,
      "SESSION_REQUIRED",
      "Please sign in again in this tab",
    );
  }
  return `delsu_refresh_${id}`;
}
