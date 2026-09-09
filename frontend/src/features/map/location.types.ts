export type LocationCategory="academic"|"administrative"|"hostel"|"health"|"security"|"food"|"transport"|"banking"|"recreation"|"worship"|"service"|"landmark"|"other";
export interface CampusLocation{_id:string;name:string;description?:string;category:LocationCategory;area:string;campusSite?:string;latitude:number;longitude:number;address?:string;isActive:boolean;isVerified:boolean;sourceLabel?:string}
export interface LivePosition{latitude:number;longitude:number;accuracy:number;heading:number|null;speed:number|null;timestamp:number}
