import { apiClient } from "@/services/api/axios";import type { CommunityInput,CommunityPost } from "./community.types";
type R<T>={success:true;data:T;message?:string};
export const communityApi={
 async list(params:Record<string,string|undefined>={}){const {data}=await apiClient.get<R<CommunityPost[]>>("/community",{params});return data.data},
 async mine(){const {data}=await apiClient.get<R<CommunityPost[]>>("/community/mine");return data.data},
 async create(input:CommunityInput){const {data}=await apiClient.post<R<CommunityPost>>("/community",input);return data.data},
 async update(id:string,input:Partial<CommunityInput>){const {data}=await apiClient.patch<R<CommunityPost>>(`/community/${id}`,input);return data.data},
 async remove(id:string){await apiClient.delete(`/community/${id}`)},
 async report(id:string,input:{reason:string;details?:string}){const {data}=await apiClient.post(`/community/${id}/reports`,input);return data.data}
};
