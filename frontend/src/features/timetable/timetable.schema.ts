import { z } from "zod";

export const timetableFormSchema = z.object({
  courseCode: z.string().trim().min(2, "Course code is required").max(20),
  courseTitle: z.string().trim().min(2, "Course title is required").max(120),
  lecturer: z.string().trim().max(120).optional(),
  day: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Start time is required"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "End time is required"),
  venue: z.string().trim().min(1, "Venue is required").max(120),
  color: z.string().default("emerald"),
  notes: z.string().trim().max(500).optional(),
  isCarryOver: z.boolean().default(false),
  sourceLevel: z.coerce.number().int().min(100).max(700).optional(),
  source: z.enum(["manual", "imported_current_level", "imported_carry_over"]).default("manual"),
  allowConflict: z.boolean().default(false),
}).refine((data) => data.endTime > data.startTime, { path: ["endTime"], message: "End time must be later than start time" })
  .refine((data) => !data.isCarryOver || Boolean(data.sourceLevel), { path: ["sourceLevel"], message: "Choose the original level for a carry-over class" });

export type TimetableFormInput = z.input<typeof timetableFormSchema>;
export type TimetableFormValues = z.output<typeof timetableFormSchema>;
