import { Schema, model, type InferSchemaType } from "mongoose";
import { COMMUNITY_CATEGORIES, COMMUNITY_STATUSES } from "./community.types.js";

const communityPostSchema = new Schema({
  title: { type: String, required: true, trim: true, minlength: 4, maxlength: 140 },
  body: { type: String, required: true, trim: true, minlength: 10, maxlength: 2500 },
  category: { type: String, enum: COMMUNITY_CATEGORIES, required: true, index: true },
  area: { type: String, trim: true, maxlength: 120, index: true },
  imageUrls: [{ type: String, trim: true, maxlength: 500 }],
  status: { type: String, enum: COMMUNITY_STATUSES, default: "pending", index: true },
  rejectionReason: { type: String, trim: true, maxlength: 500 },
  submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  moderatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  moderatedAt: { type: Date },
}, { timestamps: true, versionKey: false });

communityPostSchema.index({ status: 1, category: 1, createdAt: -1 });
communityPostSchema.index({ title: "text", body: "text", area: "text" });
export type CommunityPostDocument = InferSchemaType<typeof communityPostSchema> & { _id: { toString(): string } };
export const CommunityPostModel = model("CommunityPost", communityPostSchema);
