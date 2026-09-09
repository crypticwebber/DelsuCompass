export const COMMUNITY_CATEGORIES = ["campus_tip","academics","transport","food","services","lost_found","general"] as const;
export type CommunityCategory = typeof COMMUNITY_CATEGORIES[number];
export const COMMUNITY_STATUSES = ["pending","approved","rejected","archived"] as const;
export type CommunityStatus = typeof COMMUNITY_STATUSES[number];
export const COMMUNITY_REPORT_STATUSES = ["pending","resolved","dismissed"] as const;
