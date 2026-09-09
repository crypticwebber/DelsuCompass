export const NAVIGATION_MODES = ["walking", "driving", "cycling"] as const;
export type NavigationMode = (typeof NAVIGATION_MODES)[number];

export interface NavigationStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  streetName?: string;
  wayPoints?: [number, number];
}

export interface NavigationRoute {
  mode: NavigationMode;
  distanceMeters: number;
  durationSeconds: number;
  geometry: [number, number][];
  steps: NavigationStep[];
}
