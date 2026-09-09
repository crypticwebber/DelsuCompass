export const ACCOMMODATION_STATUSES = ["pending", "approved", "rejected", "unavailable"] as const;
export type AccommodationStatus = (typeof ACCOMMODATION_STATUSES)[number];

export const ROOM_TYPES = ["single_room", "self_contained", "one_bedroom", "two_bedroom", "shared_room", "hostel", "other"] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

export const UTILITY_LEVELS = ["poor", "fair", "good", "very_good"] as const;
export type UtilityLevel = (typeof UTILITY_LEVELS)[number];

export const REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;
export const REPORT_STATUSES = ["pending", "resolved", "dismissed"] as const;
