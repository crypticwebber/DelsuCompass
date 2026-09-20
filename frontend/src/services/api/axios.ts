import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { authTokenStore } from "@/store/auth.store";
import { authSessionStore } from "@/store/auth-session.store";
import type { AuthPayload } from "@/features/auth/auth.types";

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 15_000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const refreshClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 15_000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = authTokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // The client defaults to JSON for normal API calls. Multipart requests must
  // not inherit that header, otherwise Axios can serialize FormData as JSON and
  // Multer receives no file. Let the browser generate the multipart boundary.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }

  return config;
});

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };
let refreshPromise: Promise<AuthPayload> | null = null;

export function refreshSession(): Promise<AuthPayload> {
  const sessionId = authSessionStore.get();
  if (!sessionId)
    return Promise.reject(new Error("Please sign in in this tab"));
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<{ data: AuthPayload }>("/auth/refresh", undefined, {
        headers: { "X-Session-Id": sessionId },
      })
      .then(({ data }) => {
        if (authSessionStore.get() !== sessionId)
          throw new Error("Session changed");
        authTokenStore.set(data.data.accessToken);
        return data.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;
    const url = original?.url ?? "";
    const isAuthBootstrap = url.includes("/auth/") && !url.includes("/auth/me");

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      isAuthBootstrap
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const { accessToken: token } = await refreshSession();
      original.headers.Authorization = `Bearer ${token}`;
      return apiClient(original);
    } catch (refreshError) {
      authTokenStore.clear();
      return Promise.reject(refreshError);
    }
  },
);
