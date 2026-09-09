import { z } from "zod";
import { ROOM_TYPES, UTILITY_LEVELS } from "./accommodation.types.js";
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid resource id");
const url = z.string().url().max(500);
const body = z.object({
  title: z.string().trim().min(4).max(140),
  area: z.string().trim().min(2).max(100),
  addressLandmark: z.string().trim().min(3).max(220),
  annualRent: z.coerce.number().min(0).max(100000000),
  roomType: z.enum(ROOM_TYPES),
  description: z.string().trim().min(10).max(1600),
  facilities: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  distanceToCampusKm: z.coerce.number().min(0).max(100).optional(),
  waterSupply: z.enum(UTILITY_LEVELS).optional(),
  electricity: z.enum(UTILITY_LEVELS).optional(),
  security: z.enum(UTILITY_LEVELS).optional(),
  imageUrls: z.array(url).max(8).default([]),
  contactName: z.string().trim().min(2).max(120),
  contactPhone: z.string().trim().min(7).max(30),
});
export const createAccommodationSchema = z.object({ body });
export const updateAccommodationSchema = z.object({ params: z.object({ id: objectId }), body: body.partial() });
export const accommodationIdSchema = z.object({ params: z.object({ id: objectId }) });
export const publicAccommodationListSchema = z.object({ query: z.object({
  search: z.string().trim().max(100).optional(), area: z.string().trim().max(100).optional(), roomType: z.enum(ROOM_TYPES).optional(),
  minPrice: z.coerce.number().min(0).optional(), maxPrice: z.coerce.number().min(0).optional(), maxDistance: z.coerce.number().min(0).max(100).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "distance"]).optional().default("newest"),
}) });
export const createReviewSchema = z.object({ params: z.object({ id: objectId }), body: z.object({
  rating: z.coerce.number().int().min(1).max(5), priceFairness: z.coerce.number().int().min(1).max(5).optional(), water: z.coerce.number().int().min(1).max(5).optional(),
  electricity: z.coerce.number().int().min(1).max(5).optional(), security: z.coerce.number().int().min(1).max(5).optional(), environment: z.coerce.number().int().min(1).max(5).optional(),
  comment: z.string().trim().max(700).optional(),
}) });
export const reportAccommodationSchema = z.object({ params: z.object({ id: objectId }), body: z.object({ reason: z.string().trim().min(3).max(100), details: z.string().trim().max(700).optional() }) });
export const adminListingQuerySchema = z.object({ query: z.object({ status: z.enum(["pending", "approved", "rejected", "unavailable"]).optional().default("pending") }) });
export const moderateListingSchema = z.object({ params: z.object({ id: objectId }), body: z.object({ status: z.enum(["approved", "rejected", "unavailable"]), reason: z.string().trim().max(500).optional() }).superRefine((v,ctx)=>{ if(v.status === "rejected" && (!v.reason || v.reason.length < 5)) ctx.addIssue({ code:"custom", path:["reason"], message:"A clear rejection reason of at least 5 characters is required" }); }) });
export const adminReviewQuerySchema = z.object({ query: z.object({ status: z.enum(["pending", "approved", "rejected"]).optional().default("pending") }) });
export const moderateReviewSchema = z.object({ params: z.object({ id: objectId }), body: z.object({ status: z.enum(["approved", "rejected"]) }) });
export const adminReportQuerySchema = z.object({ query: z.object({ status: z.enum(["pending", "resolved", "dismissed"]).optional().default("pending") }) });
export const resolveReportSchema = z.object({ params: z.object({ id: objectId }), body: z.object({ status: z.enum(["resolved", "dismissed"]), resolutionNote: z.string().trim().max(500).optional() }) });
