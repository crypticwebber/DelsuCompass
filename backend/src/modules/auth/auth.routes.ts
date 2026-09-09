import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authenticate } from "./auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authRateLimiter } from "../../middleware/security.middleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.validator.js";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, validate(registerSchema), authController.register);
authRouter.post("/login", authRateLimiter, validate(loginSchema), authController.login);
authRouter.post("/refresh", authRateLimiter, authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.post("/verify-email", validate(verifyEmailSchema), authController.verifyEmail);
authRouter.post("/resend-verification", authRateLimiter, validate(resendVerificationSchema), authController.resendVerification);
authRouter.post("/forgot-password", authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
authRouter.post("/reset-password", authRateLimiter, validate(resetPasswordSchema), authController.resetPassword);
authRouter.get("/me", authenticate, authController.me);
