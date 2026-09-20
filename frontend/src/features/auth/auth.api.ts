import { apiClient, refreshSession } from "@/services/api/axios";
import { authSessionStore } from "@/store/auth-session.store";
import type { AuthPayload, AuthUser } from "./auth.types";
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
export const authApi = {
  async register(input: { fullName: string; email: string; password: string }) {
    const { data } = await apiClient.post<ApiResponse<{ user: AuthUser }>>(
      "/auth/register",
      input,
    );
    return data;
  },
  async login(input: { email: string; password: string }) {
    const id = crypto.randomUUID();
    const { data } = await apiClient.post<ApiResponse<AuthPayload>>(
      "/auth/login",
      input,
      { headers: { "X-Session-Id": id } },
    );
    authSessionStore.set(id);
    return data.data;
  },
  refresh: refreshSession,
  async logout() {
    const id = authSessionStore.get();
    if (id)
      await apiClient.post("/auth/logout", undefined, {
        headers: { "X-Session-Id": id },
      });
  },
  async me() {
    const { data } =
      await apiClient.get<ApiResponse<{ user: AuthUser }>>("/auth/me");
    return data.data.user;
  },
  async verifyEmail(input: { email: string; otp: string }) {
    const { data } = await apiClient.post<ApiResponse<{ user: AuthUser }>>(
      "/auth/verify-email",
      input,
    );
    return data;
  },
  async resendVerification(email: string) {
    const { data } = await apiClient.post<ApiResponse<Record<string, never>>>(
      "/auth/resend-verification",
      { email },
    );
    return data;
  },
  async forgotPassword(email: string) {
    const { data } = await apiClient.post<ApiResponse<Record<string, never>>>(
      "/auth/forgot-password",
      { email },
    );
    return data;
  },
  async resetPassword(input: {
    token: string;
    password: string;
    confirmPassword: string;
  }) {
    const { data } = await apiClient.post<ApiResponse<Record<string, never>>>(
      "/auth/reset-password",
      input,
    );
    return data;
  },
};
