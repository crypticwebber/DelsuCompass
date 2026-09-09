import { z } from "zod";
import { LOCATION_CATEGORIES } from "./location.types.js";
const objectId=z.string().regex(/^[a-f\d]{24}$/i,"Invalid id");
const base={
  name:z.string().trim().min(2).max(120),
  description:z.string().trim().max(1000).optional().or(z.literal("")),
  category:z.enum(LOCATION_CATEGORIES),
  area:z.string().trim().min(2).max(120),
  campusSite:z.string().trim().max(80).optional().or(z.literal("")),
  latitude:z.coerce.number().min(-90).max(90),
  longitude:z.coerce.number().min(-180).max(180),
  address:z.string().trim().max(250).optional().or(z.literal("")),
  isActive:z.boolean().optional(),
  isVerified:z.boolean().optional(),
  sourceLabel:z.string().trim().max(120).optional().or(z.literal("")),
};
export const listLocationsSchema=z.object({query:z.object({category:z.enum(LOCATION_CATEGORIES).optional(),search:z.string().trim().max(100).optional(),area:z.string().trim().max(120).optional(),campusSite:z.string().trim().max(80).optional()})});
export const idSchema=z.object({params:z.object({id:objectId})});
export const createLocationSchema=z.object({body:z.object(base)});
export const updateLocationSchema=z.object({params:z.object({id:objectId}),body:z.object(base).partial().refine(v=>Object.keys(v).length>0,"No update supplied")});
