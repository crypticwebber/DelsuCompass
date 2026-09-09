import type { WeekDay } from "../timetable.types.js";

export type ImportSourceType = "csv" | "xlsx" | "docx" | "pdf";
export type MatchConfidence = "high" | "medium" | "low";
export type TimetableEntrySource = "manual" | "imported_current_level" | "imported_carry_over";

export interface ParsedTimetableEntry {
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
  source: TimetableEntrySource;
  confidence: MatchConfidence;
  warnings: string[];
}

export interface ParsedTimetableSection {
  id: string;
  department?: string;
  level?: number;
  faculty?: string;
  entries: ParsedTimetableEntry[];
}

export interface TimetableAnalysisResult {
  fileName: string;
  sourceType: ImportSourceType;
  studentProfile: { faculty?: string; department?: string; level?: number };
  matchedCurrentSectionIds: string[];
  confidence: MatchConfidence;
  currentLevelEntries: ParsedTimetableEntry[];
  carryOverCandidates: ParsedTimetableEntry[];
  detectedSections: Array<{ id: string; department?: string; level?: number; faculty?: string; entryCount: number }>;
  warnings: string[];
}
