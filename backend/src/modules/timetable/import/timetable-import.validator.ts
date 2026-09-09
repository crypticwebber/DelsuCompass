import { z } from "zod";

const entry = z.object({
  courseCode: z.string().trim().min(2).max(20),
  courseTitle: z.string().trim().min(1).max(120),
  lecturer: z.string().trim().max(120).optional(),
  day: z.enum(["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  venue: z.string().trim().min(1).max(120),
  isCarryOver: z.boolean().default(false),
  sourceLevel: z.number().int().min(100).max(700).optional(),
  source: z.enum(["imported_current_level", "imported_carry_over"]),
});

export const confirmImportSchema = z.object({
  body: z.object({
    entries: z.array(entry).min(1).max(100),
    mode: z.enum(["add", "replace"]).default("add"),
    defaultReminderMinutes: z.number().int().min(0).max(10080).nullable().default(null),
    allowConflicts: z.boolean().default(false),
  }),
});
