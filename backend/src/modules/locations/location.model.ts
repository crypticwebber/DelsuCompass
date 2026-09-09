import { Schema, model, type InferSchemaType } from "mongoose";
import { LOCATION_CATEGORIES } from "./location.types.js";

const locationSchema = new Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120, index: true },
  description: { type: String, trim: true, maxlength: 1000 },
  category: { type: String, enum: LOCATION_CATEGORIES, required: true, index: true },
  area: { type: String, required: true, trim: true, maxlength: 120, index: true },
  campusSite: { type: String, trim: true, maxlength: 80, index: true },
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },
  address: { type: String, trim: true, maxlength: 250 },
  isActive: { type: Boolean, default: true, index: true },
  isVerified: { type: Boolean, default: true, index: true },
  sourceLabel: { type: String, trim: true, maxlength: 120 },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true, versionKey: false });
locationSchema.index({ name: "text", description: "text", area: "text", address: "text" });
locationSchema.index({ isActive: 1, category: 1, area: 1 });
export type LocationDocument = InferSchemaType<typeof locationSchema> & { _id: { toString(): string } };
export const LocationModel = model("Location", locationSchema);
