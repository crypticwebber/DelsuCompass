export const WEEK_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

export interface TimetableEntryDocumentShape {
  userId: string;
  courseCode: string;
  courseTitle: string;
  lecturer?: string;
  day: WeekDay;
  startTime: string;
  endTime: string;
  venue: string;
  color?: string;
  notes?: string;
  isCarryOver?: boolean;
  sourceLevel?: number;
  source?: "manual" | "imported_current_level" | "imported_carry_over";
}
