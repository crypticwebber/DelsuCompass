import { z } from "zod";
import { COMMUNITY_CATEGORIES, COMMUNITY_REPORT_STATUSES, COMMUNITY_STATUSES } from "./community.types.js";
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const fields = {
 title: z.string().trim().min(4).max(140), body: z.string().trim().min(10).max(2500),
 category: z.enum(COMMUNITY_CATEGORIES), area: z.string().trim().max(120).optional().or(z.literal("")),
 imageUrls: z.array(z.string().url().max(500)).max(6).optional()
};
export const listCommunitySchema=z.object({query:z.object({category:z.enum(COMMUNITY_CATEGORIES).optional(),search:z.string().trim().max(100).optional(),area:z.string().trim().max(120).optional()})});
export const idSchema=z.object({params:z.object({id:objectId})});
export const createCommunitySchema=z.object({body:z.object(fields)});
export const updateCommunitySchema=z.object({params:z.object({id:objectId}),body:z.object(fields).partial().refine(v=>Object.keys(v).length>0,"No update supplied")});
export const reportCommunitySchema=z.object({params:z.object({id:objectId}),body:z.object({reason:z.string().trim().min(3).max(180),details:z.string().trim().max(800).optional()})});
export const adminCommunityQuerySchema=z.object({query:z.object({status:z.enum(COMMUNITY_STATUSES).optional()})});
export const moderateCommunitySchema=z.object({params:z.object({id:objectId}),body:z.object({status:z.enum(["approved","rejected","archived"]),reason:z.string().trim().max(500).optional()}).superRefine((v,ctx)=>{if(v.status==="rejected"&&(!v.reason||v.reason.length<5))ctx.addIssue({code:"custom",path:["reason"],message:"A clear rejection reason of at least 5 characters is required"})})});
export const adminReportQuerySchema=z.object({query:z.object({status:z.enum(COMMUNITY_REPORT_STATUSES).optional()})});
export const resolveReportSchema=z.object({params:z.object({id:objectId}),body:z.object({status:z.enum(["resolved","dismissed"]),resolutionNote:z.string().trim().max(500).optional()})});
