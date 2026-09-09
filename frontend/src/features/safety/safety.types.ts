export type SafetyCategory="security"|"harassment"|"accident"|"fire"|"road_hazard"|"lighting"|"suspicious_activity"|"other";
export type SafetySeverity="low"|"moderate"|"high"|"critical";
export type SafetyReportStatus="pending"|"reviewing"|"resolved"|"dismissed";
export type SafetyAlertStatus="active"|"expired"|"archived";
export type SafetyAlert={_id:string;title:string;description:string;category:SafetyCategory;severity:SafetySeverity;area:string;safetyAdvice?:string;status:SafetyAlertStatus;expiresAt?:string;publishedAt:string;createdAt:string;updatedAt:string};
export type SafetyReport={_id:string;category:SafetyCategory;severity:SafetySeverity;description:string;locationName:string;latitude?:number;longitude?:number;incidentAt:string;status:SafetyReportStatus;allowAnonymousPublicUse:boolean;resolutionNote?:string;submittedBy?:{_id:string;fullName:string;email?:string;faculty?:string;department?:string;level?:number};createdAt:string;updatedAt:string};
export type SafetyReportInput={category:SafetyCategory;severity:SafetySeverity;description:string;locationName:string;latitude?:number;longitude?:number;incidentAt:string;allowAnonymousPublicUse?:boolean};
