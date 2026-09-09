import type { RequestHandler } from "express";
import { userService } from "./user.service.js";

export const updateMyProfile: RequestHandler = async (req, res, next) => {
  try {
    const data = await userService.updateMe(req.auth!.userId, req.body);
    res.json({ success: true, message: "Profile updated", data: { user: data } });
  } catch (error) { next(error); }
};
