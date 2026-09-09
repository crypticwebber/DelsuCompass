export type CommunityCategory="campus_tip"|"academics"|"transport"|"food"|"services"|"lost_found"|"general";
export type CommunityStatus="pending"|"approved"|"rejected"|"archived";
export type CommunityPost={_id:string;title:string;body:string;category:CommunityCategory;area?:string;imageUrls:string[];status:CommunityStatus;rejectionReason?:string;submittedBy?:{_id:string;fullName:string;faculty?:string;department?:string;level?:number};createdAt:string;updatedAt:string};
export type CommunityInput={title:string;body:string;category:CommunityCategory;area?:string;imageUrls?:string[]};
