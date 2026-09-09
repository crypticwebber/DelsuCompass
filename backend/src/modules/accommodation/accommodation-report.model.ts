import { Schema, model } from "mongoose";
import { REPORT_STATUSES } from "./accommodation.types.js";
const reportSchema = new Schema({
  accommodationId: { type: Schema.Types.ObjectId, ref: "Accommodation", required: true, index: true },
  reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  reason: { type: String, required: true, trim: true, maxlength: 100 },
  details: { type: String, trim: true, maxlength: 700 },
  status: { type: String, enum: REPORT_STATUSES, default: "pending", index: true },
  handledBy: { type: Schema.Types.ObjectId, ref: "User" },
  handledAt: { type: Date },
  resolutionNote: { type: String, trim: true, maxlength: 500 },
}, { timestamps: true, versionKey: false });
reportSchema.index({ accommodationId: 1, reportedBy: 1, status: 1 });
export const AccommodationReportModel = model("AccommodationReport", reportSchema);
