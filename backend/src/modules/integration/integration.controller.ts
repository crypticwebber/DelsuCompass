import type { RequestHandler } from "express";
import { integrationService } from "./integration.service.js";

export const dashboard: RequestHandler = async (req, res, next) => {
  try {
    res.json({ success: true, data: await integrationService.dashboard(req.auth!.userId) });
  } catch (error) {
    next(error);
  }
};
