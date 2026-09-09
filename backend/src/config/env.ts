import "dotenv/config";
import { z } from "zod";

const boolString = z.enum(["true", "false"]).default("false").transform((value) => value === "true");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1),
  CLIENT_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  OPENROUTESERVICE_API_KEY: z.string().min(1).optional(),
  OPENROUTESERVICE_BASE_URL: z.string().url().default("https://api.heigit.org/openrouteservice/v2"),

  RESEND_ENABLED: boolString,
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM: z.string().default("DELSU Compass <onboarding@resend.dev>"),

  CLOUDINARY_ENABLED: boolString,
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  CLOUDINARY_FOLDER: z.string().default("delsu-compass"),
}).superRefine((value, ctx) => {
  if (value.RESEND_ENABLED && !value.RESEND_API_KEY) ctx.addIssue({ code: "custom", path: ["RESEND_API_KEY"], message: "RESEND_API_KEY is required when RESEND_ENABLED=true" });
  if (value.CLOUDINARY_ENABLED) {
    if (!value.CLOUDINARY_CLOUD_NAME) ctx.addIssue({ code: "custom", path: ["CLOUDINARY_CLOUD_NAME"], message: "Cloudinary cloud name is required" });
    if (!value.CLOUDINARY_API_KEY) ctx.addIssue({ code: "custom", path: ["CLOUDINARY_API_KEY"], message: "Cloudinary API key is required" });
    if (!value.CLOUDINARY_API_SECRET) ctx.addIssue({ code: "custom", path: ["CLOUDINARY_API_SECRET"], message: "Cloudinary API secret is required" });
  }
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}
export const env = parsed.data;
