import { Router } from "express";
import { authenticate,requireRole } from "../auth/auth.middleware.js";
import { UserRole } from "../users/user.types.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as c from "./safety.controller.js";import * as s from "./safety.validator.js";
export const safetyRouter=Router();safetyRouter.use(authenticate,requireRole(UserRole.STUDENT));safetyRouter.get("/alerts",validate(s.listAlertsSchema),c.listAlerts);safetyRouter.get("/alerts/:id",validate(s.idSchema),c.getAlert);safetyRouter.get("/reports/mine",c.myReports);safetyRouter.post("/reports",validate(s.submitReportSchema),c.submitReport);
export const safetyAdminRouter=Router();safetyAdminRouter.use(authenticate,requireRole(UserRole.ADMINISTRATOR));safetyAdminRouter.get("/stats",c.adminStats);safetyAdminRouter.get("/reports",validate(s.adminReportQuerySchema),c.adminReports);safetyAdminRouter.patch("/reports/:id",validate(s.updateReportStatusSchema),c.adminUpdateReport);safetyAdminRouter.get("/alerts",validate(s.adminAlertQuerySchema),c.adminAlerts);safetyAdminRouter.post("/alerts",validate(s.createAlertSchema),c.adminCreateAlert);safetyAdminRouter.patch("/alerts/:id",validate(s.updateAlertSchema),c.adminUpdateAlert);
