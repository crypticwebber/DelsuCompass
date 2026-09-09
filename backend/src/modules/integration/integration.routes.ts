import { Router } from "express";
import { authenticate, requireRole } from "../auth/auth.middleware.js";
import { UserRole } from "../users/user.types.js";
import { dashboard } from "./integration.controller.js";

export const integrationRouter = Router();
integrationRouter.use(authenticate, requireRole(UserRole.STUDENT));
integrationRouter.get("/dashboard", dashboard);
