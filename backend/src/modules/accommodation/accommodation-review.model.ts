import { Schema, model } from "mongoose";
import { REVIEW_STATUSES } from "./accommodation.types.js";

const reviewSchema = new Schema({
  accommodationId: { type: Schema.Types.ObjectId, ref: "Accommodation", required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  priceFairness: { type: Number, min: 1, max: 5 },
  water: { type: Number, min: 1, max: 5 },
  electricity: { type: Number, min: 1, max: 5 },
  security: { type: Number, min: 1, max: 5 },
  environment: { type: Number, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 700 },
  status: { type: String, enum: REVIEW_STATUSES, default: "pending", index: true },
  moderatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  moderatedAt: { type: Date },
}, { timestamps: true, versionKey: false });
reviewSchema.index({ accommodationId: 1, userId: 1 }, { unique: true });
export const AccommodationReviewModel = model("AccommodationReview", reviewSchema);
