import type { TimetableEntry } from "@/features/timetable/timetable.types";

export interface Reminder {
  _id: string;
  timetableEntryId: TimetableEntry;
  title?: string;
  minutesBefore: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}
