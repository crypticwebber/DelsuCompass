import { z } from "zod";

export const adminUserListSchema = z.object({ query: z.object({
  search: z.string().trim().max(120).optional(),
  status: z.enum(["active", "disabled"]).optional(),
  verified: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}) });

export const adminUserStatusSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ isActive: z.boolean() }),
});
