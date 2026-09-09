export const NOTIFICATION_TYPES = ["class_reminder","moderation","safety_alert","official_notice","event_reminder","opportunity_deadline","system"] as const;
export type NotificationType = typeof NOTIFICATION_TYPES[number];
