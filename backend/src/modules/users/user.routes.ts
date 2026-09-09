import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { updateMyProfile } from "./user.controller.js";
import { updateMyProfileSchema } from "./user.validator.js";

export const userRouter = Router();
userRouter.use(authenticate);
userRouter.patch("/me", validate(updateMyProfileSchema), updateMyProfile);
