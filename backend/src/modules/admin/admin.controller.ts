import type { RequestHandler } from "express";
import { adminService } from "./admin.service.js";

export const getAdminOverview: RequestHandler = async (_req, res, next) => {
  try { res.json({ success: true, data: await adminService.overview() }); } catch (error) { next(error); }
};

export const listAdminUsers: RequestHandler = async (req, res, next) => {
  try { res.json({ success: true, data: await adminService.users(req.query as any) }); } catch (error) { next(error); }
};

export const updateAdminUserStatus: RequestHandler = async (req, res, next) => {
  try {
    const data = await adminService.setUserStatus(req.auth!.userId, String(req.params.id), req.body.isActive);
    res.json({ success: true, message: data.isActive ? "Student account enabled" : "Student account disabled", data });
  } catch (error) { next(error); }
};
