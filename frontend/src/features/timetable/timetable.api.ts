import { apiClient } from "@/services/api/axios";
import type { ImportEntry, TimetableAnalysis, TimetableEntry, TimetableInput, WeekDay } from "./timetable.types";

type ApiResponse<T> = { success: true; data: T; message?: string };
const validDays = new Set(["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]);
function normalizeEntry(entry: TimetableEntry): TimetableEntry {
  const day = String(entry.day ?? "").trim().toLowerCase();
  return { ...entry, day: (validDays.has(day) ? day : "monday") as WeekDay };
}

export const timetableApi = {
  async list() { const { data } = await apiClient.get<ApiResponse<TimetableEntry[]>>("/timetable"); return (data.data ?? []).map(normalizeEntry); },
  async create(input: TimetableInput) { const { data } = await apiClient.post<ApiResponse<TimetableEntry>>("/timetable", input); return normalizeEntry(data.data); },
  async update(id: string, input: Partial<TimetableInput>) { const { data } = await apiClient.patch<ApiResponse<TimetableEntry>>(`/timetable/${id}`, input); return normalizeEntry(data.data); },
  async remove(id: string) { await apiClient.delete(`/timetable/${id}`); },
  async analyzeImport(file: File) { const form = new FormData(); form.append("file", file); const { data } = await apiClient.post<ApiResponse<TimetableAnalysis>>("/timetable/import/analyze", form, { headers: { "Content-Type": "multipart/form-data" }, timeout: 45_000 }); return data.data; },
  async confirmImport(input: { entries: ImportEntry[]; mode: "add" | "replace"; defaultReminderMinutes: number | null; allowConflicts: boolean; }) {
    const payload = { ...input, entries: input.entries.map(({ tempId: _tempId, confidence: _confidence, warnings: _warnings, department: _department, level: _level, ...entry }) => entry) };
    const { data } = await apiClient.post<ApiResponse<{ createdCount: number; reminderCount: number; conflicts: Array<{a:string;b:string}> }>>("/timetable/import/confirm", payload);
    return data.data;
  },
};
