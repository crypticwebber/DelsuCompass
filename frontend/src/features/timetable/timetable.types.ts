export type WeekDay = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
export type TimetableSource = "manual" | "imported_current_level" | "imported_carry_over";

export interface TimetableEntry {
  _id: string;
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
  source?: TimetableSource;
  createdAt: string;
  updatedAt: string;
}

export interface TimetableInput {
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
  source?: TimetableSource;
  allowConflict?: boolean;
}

export interface ImportEntry {
  tempId: string;
  courseCode: string;
  courseTitle: string;
  lecturer?: string;
  day: WeekDay;
  startTime: string;
  endTime: string;
  venue: string;
  department?: string;
  level?: number;
  sourceLevel?: number;
  isCarryOver: boolean;
  source: "imported_current_level" | "imported_carry_over";
  confidence: "high" | "medium" | "low";
  warnings: string[];
}

export interface TimetableAnalysis {
  fileName: string;
  sourceType: "csv" | "xlsx" | "docx" | "pdf";
  studentProfile: { faculty?: string; department?: string; level?: number };
  matchedCurrentSectionIds: string[];
  confidence: "high" | "medium" | "low";
  currentLevelEntries: ImportEntry[];
  carryOverCandidates: ImportEntry[];
  detectedSections: Array<{ id: string; department?: string; level?: number; faculty?: string; entryCount: number }>;
  warnings: string[];
}

export const weekDays: WeekDay[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
