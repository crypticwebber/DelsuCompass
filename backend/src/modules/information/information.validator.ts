import { z } from "zod";
import { GUIDE_CATEGORIES, NOTICE_AUDIENCES, NOTICE_CATEGORIES, NOTICE_STATUSES } from "./information.types.js";
const objectId=z.string().regex(/^[a-f\d]{24}$/i,"Invalid id");
const optionalUrl=z.string().url().max(700).optional().or(z.literal(""));
const optionalDate=z.string().datetime().optional().nullable().or(z.literal(""));
const noticeBase={
 title:z.string().trim().min(4).max(180),summary:z.string().trim().min(10).max(420),content:z.string().trim().min(10).max(6000),
 category:z.enum(NOTICE_CATEGORIES),audience:z.enum(NOTICE_AUDIENCES),importantDate:optionalDate,sourceUrl:optionalUrl,
 sourceLabel:z.string().trim().max(160).optional().or(z.literal("")),isFeatured:z.boolean().optional(),status:z.enum(NOTICE_STATUSES),expiresAt:optionalDate,
};
const guideBase={title:z.string().trim().min(3).max(160),category:z.enum(GUIDE_CATEGORIES),excerpt:z.string().trim().min(10).max(360),content:z.string().trim().min(10).max(7000),sourceUrl:optionalUrl,sourceLabel:z.string().trim().max(160).optional().or(z.literal("")),sortOrder:z.coerce.number().int().min(0).max(1000).optional(),isPublished:z.boolean().optional()};
export const publicNoticeQuerySchema=z.object({query:z.object({category:z.enum(NOTICE_CATEGORIES).optional(),featured:z.enum(["true","false"]).optional(),limit:z.coerce.number().int().min(1).max(50).optional()})});
export const publicGuideQuerySchema=z.object({query:z.object({category:z.enum(GUIDE_CATEGORIES).optional()})});
export const idSchema=z.object({params:z.object({id:objectId})});
export const adminNoticeQuerySchema=z.object({query:z.object({status:z.enum(NOTICE_STATUSES).optional(),category:z.enum(NOTICE_CATEGORIES).optional(),search:z.string().trim().max(120).optional()})});
export const createNoticeSchema=z.object({body:z.object(noticeBase)});
export const updateNoticeSchema=z.object({params:z.object({id:objectId}),body:z.object(noticeBase).partial().refine(v=>Object.keys(v).length>0,"No update supplied")});
export const adminGuideQuerySchema=z.object({query:z.object({category:z.enum(GUIDE_CATEGORIES).optional()})});
export const createGuideSchema=z.object({body:z.object(guideBase)});
export const updateGuideSchema=z.object({params:z.object({id:objectId}),body:z.object(guideBase).partial().refine(v=>Object.keys(v).length>0,"No update supplied")});
