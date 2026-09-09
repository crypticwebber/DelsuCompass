import { z } from "zod";
export const passwordSchema=z.string().min(8,"Password must contain at least 8 characters").max(128).regex(/[A-Z]/,"Password must contain an uppercase letter").regex(/[a-z]/,"Password must contain a lowercase letter").regex(/[0-9]/,"Password must contain a number");
export const registerSchema=z.object({body:z.object({fullName:z.string().trim().min(2).max(120),email:z.string().trim().toLowerCase().email(),password:passwordSchema})});
export const loginSchema=z.object({body:z.object({email:z.string().trim().toLowerCase().email(),password:z.string().min(1).max(128)})});
export const verifyEmailSchema=z.object({body:z.object({email:z.string().trim().toLowerCase().email(),otp:z.string().regex(/^\d{6}$/,"Enter the 6-digit code")})});
export const resendVerificationSchema=z.object({body:z.object({email:z.string().trim().toLowerCase().email()})});
export const forgotPasswordSchema=z.object({body:z.object({email:z.string().trim().toLowerCase().email()})});
export const resetPasswordSchema=z.object({body:z.object({token:z.string().min(20),password:passwordSchema,confirmPassword:z.string()}).refine(d=>d.password===d.confirmPassword,{path:["confirmPassword"],message:"Passwords do not match"})});
