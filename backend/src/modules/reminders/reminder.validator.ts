import { z } from "zod";

const reminderBody = z.object({
  timetableEntryId: z.string().min(1),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  minutesBefore: z.coerce.number().int().min(0).max(10080).default(15),
  enabled: z.boolean().default(true),
});

export const createReminderSchema = z.object({ body: reminderBody });
export const updateReminderSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: reminderBody.omit({ timetableEntryId: true }).partial(),
});
export const reminderIdSchema = z.object({ params: z.object({ id: z.string().min(1) }) });
