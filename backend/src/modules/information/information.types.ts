export const NOTICE_CATEGORIES = ["admission","academic","registration","examination","campus","general"] as const;
export const NOTICE_AUDIENCES = ["public","students","all"] as const;
export const NOTICE_STATUSES = ["draft","published","archived"] as const;
export const GUIDE_CATEGORIES = ["about_delsu","campus_abraka","accommodation","admissions","academic","new_students","general"] as const;
export type NoticeCategory = typeof NOTICE_CATEGORIES[number];
export type NoticeAudience = typeof NOTICE_AUDIENCES[number];
export type NoticeStatus = typeof NOTICE_STATUSES[number];
export type GuideCategory = typeof GUIDE_CATEGORIES[number];
