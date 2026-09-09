import { apiClient } from "@/services/api/axios";
import type { CampusEvent,EventInput } from "./event.types";
type R<T>={success:true;data:T;message?:string};
const iso=(value?:string)=>value?new Date(value).toISOString():undefined;
export const eventApi={
 async list(params:Record<string,string|undefined>={}){const{data}=await apiClient.get<R<CampusEvent[]>>("/events",{params});return data.data},
 async mine(){const{data}=await apiClient.get<R<CampusEvent[]>>("/events/mine");return data.data},
 async create(input:EventInput){const payload={...input,startDate:iso(input.startDate),endDate:iso(input.endDate),registrationUrl:input.registrationUrl?.trim()||undefined,organizer:input.organizer?.trim()||undefined};const{data}=await apiClient.post<R<CampusEvent>>("/events",payload);return data.data},
 async update(id:string,input:Partial<EventInput>){const payload={...input,...(input.startDate?{startDate:iso(input.startDate)}:{}),...(input.endDate!==undefined?{endDate:iso(input.endDate)}:{}),registrationUrl:input.registrationUrl?.trim()||undefined,organizer:input.organizer?.trim()||undefined};const{data}=await apiClient.patch<R<CampusEvent>>(`/events/${id}`,payload);return data.data},
 async remove(id:string){await apiClient.delete(`/events/${id}`)},
 async report(id:string,input:{reason:string;details?:string}){const{data}=await apiClient.post(`/events/${id}/reports`,input);return data.data}
};
