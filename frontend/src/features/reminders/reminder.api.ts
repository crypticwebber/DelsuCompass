import { apiClient } from "@/services/api/axios";
import type { Reminder } from "./reminder.types";

type ApiResponse<T> = { success: true; data: T };

export const reminderApi = {
  async list() { const { data } = await apiClient.get<ApiResponse<Reminder[]>>("/reminders"); return data.data; },
  async create(input: { timetableEntryId: string; title?: string; minutesBefore: number; enabled: boolean }) { const { data } = await apiClient.post<ApiResponse<Reminder>>("/reminders", input); return data.data; },
  async update(id: string, input: { title?: string; minutesBefore?: number; enabled?: boolean }) { const { data } = await apiClient.patch<ApiResponse<Reminder>>(`/reminders/${id}`, input); return data.data; },
  async remove(id: string) { await apiClient.delete(`/reminders/${id}`); },
};
