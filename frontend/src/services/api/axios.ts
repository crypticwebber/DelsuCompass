import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { authTokenStore } from "@/store/auth.store";

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
let refreshPromise: Promise<string> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;
    const url = original?.url ?? "";
    const isAuthBootstrap = url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh");

    if (error.response?.status !== 401 || !original || original._retry || isAuthBootstrap) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshClient
          .post<{ data: { accessToken: string } }>("/auth/refresh")
          .then((response) => {
            const token = response.data.data.accessToken;
            authTokenStore.set(token);
            return token;
          })
          .finally(() => { refreshPromise = null; });
      }

      const token = await refreshPromise;
      original.headers.Authorization = `Bearer ${token}`;
      return apiClient(original);
    } catch (refreshError) {
      authTokenStore.clear();
      return Promise.reject(refreshError);
    }
  },
);
