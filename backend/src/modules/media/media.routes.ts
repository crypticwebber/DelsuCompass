import { Router } from "express";
import multer from "multer";
import { authenticate } from "../auth/auth.middleware.js";
import { uploadRateLimiter } from "../../middleware/security.middleware.js";
import { AppError } from "../../utils/AppError.js";
import { uploadImage } from "./media.controller.js";

const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => allowed.has(file.mimetype) ? cb(null, true) : cb(new AppError(400, "UNSUPPORTED_IMAGE", "Upload a JPG, PNG, WEBP or GIF image")),
});

export const mediaRouter = Router();
mediaRouter.use(authenticate, uploadRateLimiter);
mediaRouter.post("/images", upload.single("image"), uploadImage);
