import { apiClient } from "@/services/api/axios";
import type { AuthPayload,AuthUser } from "./auth.types";
interface ApiResponse<T>{success:boolean;message?:string;data:T}
export const authApi={
 async register(input:{fullName:string;email:string;password:string}){const{data}=await apiClient.post<ApiResponse<{user:AuthUser}>>("/auth/register",input);return data},
 async login(input:{email:string;password:string}){const{data}=await apiClient.post<ApiResponse<AuthPayload>>("/auth/login",input);return data.data},
 async refresh(){const{data}=await apiClient.post<ApiResponse<AuthPayload>>("/auth/refresh");return data.data},
 async logout(){await apiClient.post("/auth/logout")},
 async me(){const{data}=await apiClient.get<ApiResponse<{user:AuthUser}>>("/auth/me");return data.data.user},
 async verifyEmail(input:{email:string;otp:string}){const{data}=await apiClient.post<ApiResponse<{user:AuthUser}>>("/auth/verify-email",input);return data},
 async resendVerification(email:string){const{data}=await apiClient.post<ApiResponse<Record<string,never>>>("/auth/resend-verification",{email});return data},
 async forgotPassword(email:string){const{data}=await apiClient.post<ApiResponse<Record<string,never>>>("/auth/forgot-password",{email});return data},
 async resetPassword(input:{token:string;password:string;confirmPassword:string}){const{data}=await apiClient.post<ApiResponse<Record<string,never>>>("/auth/reset-password",input);return data},
};
