import { Router } from "express";
import { authenticate, requireRole } from "../auth/auth.middleware.js";
import { UserRole } from "../users/user.types.js";
import { validate } from "../../middleware/validate.middleware.js";
import { adminUserListSchema, adminUserStatusSchema } from "./admin.validator.js";
import { getAdminOverview, listAdminUsers, updateAdminUserStatus } from "./admin.controller.js";

export const adminRouter = Router();
adminRouter.use(authenticate, requireRole(UserRole.ADMINISTRATOR));
adminRouter.get("/access-check", (_req, res) => {
  res.json({ success: true, data: { authorized: true, role: UserRole.ADMINISTRATOR } });
});
adminRouter.get("/overview", getAdminOverview);
adminRouter.get("/users", validate(adminUserListSchema), listAdminUsers);
adminRouter.patch("/users/:id/status", validate(adminUserStatusSchema), updateAdminUserStatus);
