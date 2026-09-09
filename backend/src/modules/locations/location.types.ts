export const LOCATION_CATEGORIES = [
  "academic",
  "administrative",
  "hostel",
  "health",
  "security",
  "food",
  "transport",
  "banking",
  "recreation",
  "worship",
  "service",
  "landmark",
  "other",
] as const;
export type LocationCategory = (typeof LOCATION_CATEGORIES)[number];
