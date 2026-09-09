import { Schema, model, type InferSchemaType } from "mongoose";
import { ACCOMMODATION_STATUSES, ROOM_TYPES, UTILITY_LEVELS } from "./accommodation.types.js";

const accommodationSchema = new Schema({
  title: { type: String, required: true, trim: true, minlength: 4, maxlength: 140 },
  area: { type: String, required: true, trim: true, maxlength: 100, index: true },
  addressLandmark: { type: String, required: true, trim: true, maxlength: 220 },
  annualRent: { type: Number, required: true, min: 0, index: true },
  roomType: { type: String, enum: ROOM_TYPES, required: true, index: true },
  description: { type: String, required: true, trim: true, maxlength: 1600 },
  facilities: [{ type: String, trim: true, maxlength: 80 }],
  distanceToCampusKm: { type: Number, min: 0, max: 100, index: true },
  waterSupply: { type: String, enum: UTILITY_LEVELS },
  electricity: { type: String, enum: UTILITY_LEVELS },
  security: { type: String, enum: UTILITY_LEVELS },
  imageUrls: [{ type: String, trim: true, maxlength: 500 }],
  contactName: { type: String, required: true, trim: true, maxlength: 120 },
  contactPhone: { type: String, required: true, trim: true, maxlength: 30 },
  status: { type: String, enum: ACCOMMODATION_STATUSES, default: "pending", index: true },
  rejectionReason: { type: String, trim: true, maxlength: 500 },
  submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  moderatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  moderatedAt: { type: Date },
}, { timestamps: true, versionKey: false });

accommodationSchema.index({ status: 1, area: 1, annualRent: 1 });
accommodationSchema.index({ status: 1, roomType: 1, distanceToCampusKm: 1 });
accommodationSchema.index({ title: "text", area: "text", addressLandmark: "text", description: "text" });

export type AccommodationDocument = InferSchemaType<typeof accommodationSchema> & { _id: { toString(): string } };
export const AccommodationModel = model("Accommodation", accommodationSchema);
