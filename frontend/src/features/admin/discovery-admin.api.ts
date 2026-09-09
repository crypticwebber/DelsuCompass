import { apiClient } from "@/services/api/axios";

type R<T> = { success: true; data: T };
export type DiscoveryKind = "events" | "opportunities";

export const discoveryAdminApi = {
  async posts(kind: DiscoveryKind, status?: string) {
    const { data } = await apiClient.get<R<any[]>>(`/admin/${kind}/posts`, { params: { status } });
    return data.data;
  },
  async create(kind: DiscoveryKind, payload: Record<string, unknown>) {
    const { data } = await apiClient.post<R<any>>(`/admin/${kind}/posts`, payload);
    return data.data;
  },
  async moderate(kind: DiscoveryKind, id: string, status: string, reason?: string) {
    const { data } = await apiClient.patch<R<any>>(`/admin/${kind}/posts/${id}/moderate`, { status, reason });
    return data.data;
  },
  async reports(kind: DiscoveryKind, status?: string) {
    const { data } = await apiClient.get<R<any[]>>(`/admin/${kind}/reports`, { params: { status } });
    return data.data;
  },
  async resolve(kind: DiscoveryKind, id: string, status: "resolved" | "dismissed", resolutionNote?: string) {
    const { data } = await apiClient.patch<R<any>>(`/admin/${kind}/reports/${id}/resolve`, { status, resolutionNote });
    return data.data;
  },
  async stats(kind: DiscoveryKind) {
    const { data } = await apiClient.get<R<{ pending: number; approved: number; rejected: number; openReports: number }>>(`/admin/${kind}/stats`);
    return data.data;
  },
};
