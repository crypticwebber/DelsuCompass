import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { authenticate, requireRole } from "../auth/auth.middleware.js";
import { UserRole } from "../users/user.types.js";
import { directions } from "./navigation.controller.js";
import { directionsSchema } from "./navigation.validator.js";

export const navigationRouter = Router();
navigationRouter.use(authenticate, requireRole(UserRole.STUDENT));
navigationRouter.post("/directions", validate(directionsSchema), directions);
