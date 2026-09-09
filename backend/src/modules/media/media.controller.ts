import type { RequestHandler } from "express";
import { AppError } from "../../utils/AppError.js";
import { mediaService } from "./media.service.js";

export const uploadImage: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError(400, "IMAGE_REQUIRED", "Choose an image to upload");
    const data = await mediaService.uploadImage(req.file);
    res.status(201).json({ success: true, message: "Image uploaded", data });
  } catch (error) { next(error); }
};
