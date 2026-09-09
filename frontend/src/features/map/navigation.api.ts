import { apiClient } from "@/services/api/axios";
import type { NavigationMode, NavigationRoute } from "./navigation.types";

type R<T> = { success: true; data: T };
type Point = { latitude: number; longitude: number };

export const navigationApi = {
  async directions(start: Point, destination: Point, mode: NavigationMode) {
    const { data } = await apiClient.post<R<NavigationRoute>>("/navigation/directions", {
      start,
      destination,
      mode,
    });
    return data.data;
  },
};
