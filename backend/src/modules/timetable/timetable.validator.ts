import { z } from "zod";
import { WEEK_DAYS } from "./timetable.types.js";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm 24-hour time format");

const timetableBodyBase = z.object({
  courseCode: z.string().trim().min(2).max(20).transform((value) => value.toUpperCase()),
  courseTitle: z.string().trim().min(2).max(120),
  lecturer: z.string().trim().max(120).optional().or(z.literal("")),
  day: z.enum(WEEK_DAYS),
  startTime: time,
  endTime: time,
  venue: z.string().trim().min(1).max(120),
  color: z.string().trim().max(30).optional(),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  isCarryOver: z.boolean().optional().default(false),
  sourceLevel: z.coerce.number().int().min(100).max(700).optional(),
  source: z.enum(["manual", "imported_current_level", "imported_carry_over"]).optional().default("manual"),
  allowConflict: z.boolean().optional().default(false),
});

const timetableBody = timetableBodyBase.refine((data) => data.endTime > data.startTime, {
  path: ["endTime"],
  message: "End time must be later than start time",
});

const updateTimetableBody = timetableBodyBase.partial().refine(
  (data) => !data.startTime || !data.endTime || data.endTime > data.startTime,
  {
    path: ["endTime"],
    message: "End time must be later than start time",
  },
);

export const createTimetableEntrySchema = z.object({ body: timetableBody });

export const updateTimetableEntrySchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: updateTimetableBody,
});

export const timetableEntryIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const timetableListSchema = z.object({
  query: z.object({
    day: z.enum(WEEK_DAYS).optional(),
    courseCode: z.string().trim().optional(),
  }),
});
