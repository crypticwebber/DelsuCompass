export type EventCategory="academic"|"social"|"career"|"sports"|"religious"|"club"|"other";
export type EventStatus="pending"|"approved"|"rejected"|"archived"|"cancelled";
export type CampusEvent={_id:string;title:string;description:string;category:EventCategory;startDate:string;endDate?:string;venue:string;organizer?:string;registrationUrl?:string;imageUrls:string[];status:EventStatus;rejectionReason?:string;submittedBy?:{_id:string;fullName:string};createdAt:string;updatedAt:string};
export type EventInput={title:string;description:string;category:EventCategory;startDate:string;endDate?:string;venue:string;organizer?:string;registrationUrl?:string;imageUrls?:string[]};
