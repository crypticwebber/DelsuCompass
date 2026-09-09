import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

function validationMessage(error: ZodError) {
  const first = error.issues[0];
  if (!first) return "Invalid request data";
  const field = first.path.filter((part) => part !== "body" && part !== "query" && part !== "params").join(".");
  return field ? `${field}: ${first.message}` : first.message;
}

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const requestId = req.requestId;

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: validationMessage(error),
        details: error.flatten(),
        requestId,
      },
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE" ? "Uploaded file is too large" : "Invalid file upload";
    res.status(400).json({ success: false, error: { code: error.code, message, requestId } });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message, ...(error.details !== undefined ? { details: error.details } : {}), requestId },
    });
    return;
  }

  console.error(`[${requestId ?? "no-request-id"}]`, error);
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected server error occurred",
      requestId,
      ...(env.NODE_ENV === "development" && error instanceof Error ? { details: error.message } : {}),
    },
  });
};
