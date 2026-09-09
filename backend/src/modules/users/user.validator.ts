import { z } from "zod";

export const updateMyProfileSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).max(120).optional(),
    phoneNumber: z.string().trim().max(30).optional().or(z.literal("")),
    faculty: z.string().trim().min(2).max(120).optional(),
    department: z.string().trim().min(2).max(120).optional(),
    level: z.coerce.number().int().min(100).max(700).optional(),
  }),
});
