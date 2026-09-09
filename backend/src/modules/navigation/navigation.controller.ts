import type { RequestHandler } from "express";
import { navigationService } from "./navigation.service.js";

export const directions: RequestHandler = async (req, res, next) => {
  try {
    const { start, destination, mode } = req.body;
    res.json({
      success: true,
      data: await navigationService.directions(start, destination, mode),
    });
  } catch (error) {
    next(error);
  }
};
