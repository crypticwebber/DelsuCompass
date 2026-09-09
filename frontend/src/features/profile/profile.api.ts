import { apiClient } from "@/services/api/axios";
import type { AuthUser } from "@/features/auth/auth.types";

type ApiResponse = { success: true; data: { user: AuthUser }; message?: string };

export const profileApi = {
  async update(input: { fullName?: string; phoneNumber?: string; faculty?: string; department?: string; level?: number }) {
    const { data } = await apiClient.patch<ApiResponse>("/users/me", input);
    return data.data.user;
  },
};
