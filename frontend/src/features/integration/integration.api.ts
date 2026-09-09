import { apiClient } from "@/services/api/axios";
import type { DashboardIntegration } from "./integration.types";

type R<T> = { success: true; data: T };

export const integrationApi = {
  async dashboard() {
    const { data } = await apiClient.get<R<DashboardIntegration>>("/integration/dashboard");
    return data.data;
  },
};
