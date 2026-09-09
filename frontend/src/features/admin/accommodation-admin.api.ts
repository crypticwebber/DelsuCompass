import { apiClient } from "@/services/api/axios";
type ApiResponse<T>={success:true;data:T};
export const accommodationAdminApi={
 async createListing(input:import("@/features/accommodation/accommodation.types").AccommodationInput){const {data}=await apiClient.post<ApiResponse<any>>("/admin/accommodation/listings",input);return data.data},
 async stats(){const {data}=await apiClient.get<ApiResponse<{pendingListings:number;approvedListings:number;pendingReviews:number;pendingReports:number}>>("/admin/accommodation/stats");return data.data},
 async listings(status="pending"){const {data}=await apiClient.get<ApiResponse<any[]>>("/admin/accommodation/listings",{params:{status}});return data.data},
 async moderateListing(id:string,status:"approved"|"rejected"|"unavailable",reason?:string){const {data}=await apiClient.patch(`/admin/accommodation/listings/${id}/moderate`,{status,reason});return data.data},
 async reviews(status="pending"){const {data}=await apiClient.get<ApiResponse<any[]>>("/admin/accommodation/reviews",{params:{status}});return data.data},
 async moderateReview(id:string,status:"approved"|"rejected"){const {data}=await apiClient.patch(`/admin/accommodation/reviews/${id}/moderate`,{status});return data.data},
 async reports(status="pending"){const {data}=await apiClient.get<ApiResponse<any[]>>("/admin/accommodation/reports",{params:{status}});return data.data},
 async resolveReport(id:string,status:"resolved"|"dismissed",resolutionNote?:string){const {data}=await apiClient.patch(`/admin/accommodation/reports/${id}/resolve`,{status,resolutionNote});return data.data},
};
