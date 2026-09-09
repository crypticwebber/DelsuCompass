import type { RequestHandler } from "express";
import type { ZodType } from "zod";

/**
 * Validate and normalize request data with Zod.
 *
 * Express 5 exposes req.query through a getter without a setter. Assigning
 * directly to req.query causes validated GET requests to fail at runtime.
 * Defining an own property on the request instance safely shadows the getter
 * and lets downstream controllers receive Zod-coerced/defaulted query values.
 */
export const validate = (schema: ZodType): RequestHandler => (req, _res, next) => {
  const parsed = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!parsed.success) return next(parsed.error);

  const value = parsed.data as { body?: unknown; params?: unknown; query?: unknown };

  if (value.body !== undefined) req.body = value.body;
  if (value.params !== undefined) req.params = value.params as typeof req.params;
  if (value.query !== undefined) {
    Object.defineProperty(req, "query", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: value.query,
    });
  }

  next();
};
