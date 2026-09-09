export const REMINDER_MINUTES = [5, 10, 15, 30, 45, 60, 120, 1440] as const;
export type ReminderMinutes = (typeof REMINDER_MINUTES)[number];
