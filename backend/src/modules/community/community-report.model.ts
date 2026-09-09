import { Schema, model } from "mongoose";
import { COMMUNITY_REPORT_STATUSES } from "./community.types.js";
const schema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: "CommunityPost", required: true, index: true },
  reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  reason: { type: String, required: true, trim: true, maxlength: 180 },
  details: { type: String, trim: true, maxlength: 800 },
  status: { type: String, enum: COMMUNITY_REPORT_STATUSES, default: "pending", index: true },
  resolutionNote: { type: String, trim: true, maxlength: 500 },
  resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  resolvedAt: { type: Date },
}, { timestamps: true, versionKey: false });
schema.index({ postId: 1, reportedBy: 1, status: 1 });
export const CommunityReportModel = model("CommunityReport", schema);
