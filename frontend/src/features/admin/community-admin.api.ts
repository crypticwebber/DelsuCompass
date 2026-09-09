import { apiClient } from "@/services/api/axios";import type { CommunityPost } from "@/features/community/community.types";
type R<T>={success:true;data:T};
export type CommunityReport={_id:string;reason:string;details?:string;status:"pending"|"resolved"|"dismissed";postId?:{_id:string;title:string;category:string;status:string};reportedBy?:{fullName:string;email:string};createdAt:string};
export const communityAdminApi={
 async posts(status?:string){const {data}=await apiClient.get<R<CommunityPost[]>>("/admin/community/posts",{params:{status}});return data.data},
 async moderate(id:string,status:"approved"|"rejected"|"archived",reason?:string){const {data}=await apiClient.patch<R<CommunityPost>>(`/admin/community/posts/${id}/moderate`,{status,reason});return data.data},
 async reports(status?:string){const {data}=await apiClient.get<R<CommunityReport[]>>("/admin/community/reports",{params:{status}});return data.data},
 async resolve(id:string,status:"resolved"|"dismissed",resolutionNote?:string){const {data}=await apiClient.patch(`/admin/community/reports/${id}/resolve`,{status,resolutionNote});return data.data},
 async stats(){const {data}=await apiClient.get<R<{pending:number;approved:number;rejected:number;openReports:number}>>("/admin/community/stats");return data.data}
};
