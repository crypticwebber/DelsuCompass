import { apiClient } from "@/services/api/axios";

type ApiResponse<T> = { success: true; data: T };
export type AdminUser = {
  id: string; fullName: string; email: string; role: string; faculty?: string; department?: string; level?: number;
  phoneNumber?: string; isVerified: boolean; isActive: boolean; createdAt: string; updatedAt: string;
};
export type AdminOverview = {
  users: { totalStudents: number; activeStudents: number; unverifiedStudents: number; disabledStudents: number; administrators: number };
  moderation: {
    pendingAccommodation: number; pendingAccommodationReviews: number; accommodationReports: number;
    pendingCommunity: number; communityReports: number; pendingEvents: number; eventReports: number;
    pendingOpportunities: number; opportunityReports: number; pendingSafetyReports: number; criticalSafetyReports: number;
  };
  publicContent: { approvedAccommodation: number; approvedCommunity: number; approvedEvents: number; approvedOpportunities: number; activeSafetyAlerts: number; activeLocations: number };
  recentStudents: AdminUser[];
  generatedAt: string;
};
export type AdminUserPage = { items: AdminUser[]; total: number; page: number; limit: number; pages: number };

export const adminApi = {
  async overview() { const { data } = await apiClient.get<ApiResponse<AdminOverview>>("/admin/overview"); return data.data; },
  async users(params: { search?: string; status?: string; verified?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get<ApiResponse<AdminUserPage>>("/admin/users", { params }); return data.data;
  },
  async setUserStatus(id: string, isActive: boolean) {
    const { data } = await apiClient.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/status`, { isActive }); return data.data;
  },
};
