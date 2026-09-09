export type OpportunityType="scholarship"|"internship"|"job"|"volunteering"|"competition"|"training"|"grant"|"other";
export type OpportunityStatus="pending"|"approved"|"rejected"|"archived";
export type Opportunity={_id:string;title:string;description:string;type:OpportunityType;provider:string;deadline?:string;eligibility?:string;location?:string;applicationUrl?:string;imageUrls:string[];status:OpportunityStatus;rejectionReason?:string;submittedBy?:{_id:string;fullName:string};createdAt:string;updatedAt:string};
export type OpportunityInput={title:string;description:string;type:OpportunityType;provider:string;deadline?:string;eligibility?:string;location?:string;applicationUrl?:string;imageUrls?:string[]};
