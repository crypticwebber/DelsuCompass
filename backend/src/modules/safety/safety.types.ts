export const SAFETY_CATEGORIES = ["security","harassment","accident","fire","road_hazard","lighting","suspicious_activity","other"] as const;
export const SAFETY_SEVERITIES = ["low","moderate","high","critical"] as const;
export const SAFETY_REPORT_STATUSES = ["pending","reviewing","resolved","dismissed"] as const;
export const SAFETY_ALERT_STATUSES = ["active","expired","archived"] as const;
export type SafetyCategory = typeof SAFETY_CATEGORIES[number];
export type SafetySeverity = typeof SAFETY_SEVERITIES[number];
