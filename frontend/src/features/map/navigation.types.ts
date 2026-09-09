export type NavigationMode = "walking" | "driving" | "cycling";

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
