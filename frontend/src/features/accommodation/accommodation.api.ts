import { apiClient } from "@/services/api/axios";
import type { AccommodationDetail, AccommodationInput, AccommodationListing } from "./accommodation.types";
type ApiResponse<T>={success:true;data:T;message?:string};
export const accommodationApi={
 async list(filters:Record<string,string|number|undefined>={}){const {data}=await apiClient.get<ApiResponse<AccommodationListing[]>>("/accommodation",{params:filters});return data.data},
 async detail(id:string){const {data}=await apiClient.get<ApiResponse<AccommodationDetail>>(`/accommodation/${id}`);return data.data},
 async mine(){const {data}=await apiClient.get<ApiResponse<AccommodationListing[]>>("/accommodation/mine");return data.data},
 async create(input:AccommodationInput){const {data}=await apiClient.post<ApiResponse<AccommodationListing>>("/accommodation",input);return data.data},
 async update(id:string,input:Partial<AccommodationInput>){const {data}=await apiClient.patch<ApiResponse<AccommodationListing>>(`/accommodation/${id}`,input);return data.data},
 async remove(id:string){await apiClient.delete(`/accommodation/${id}`)},
 async review(id:string,input:{rating:number;priceFairness?:number;water?:number;electricity?:number;security?:number;environment?:number;comment?:string}){const {data}=await apiClient.post(`/accommodation/${id}/reviews`,input);return data.data},
 async report(id:string,input:{reason:string;details?:string}){const {data}=await apiClient.post(`/accommodation/${id}/reports`,input);return data.data},
};
