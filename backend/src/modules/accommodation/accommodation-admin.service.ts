import { Types } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { AccommodationModel } from "./accommodation.model.js";
import { AccommodationReviewModel } from "./accommodation-review.model.js";
import { AccommodationReportModel } from "./accommodation-report.model.js";
function ensure(id: string) { if (!Types.ObjectId.isValid(id)) throw new AppError(404, "RESOURCE_NOT_FOUND", "Resource was not found"); }
export const accommodationAdminService = {
  async createListing(adminId: string, input: Record<string, unknown>) {
    return AccommodationModel.create({ ...input, submittedBy: adminId, status: "approved", moderatedBy: adminId, moderatedAt: new Date() });
  },
  async listings(status?: string) { return AccommodationModel.find(status ? { status } : {}).populate("submittedBy", "fullName email department level").sort({ createdAt: -1 }).lean(); },
  async moderateListing(adminId: string, id: string, status: string, reason?: string) {
    ensure(id); if (status === "rejected" && !reason) throw new AppError(400, "REJECTION_REASON_REQUIRED", "Provide a reason when rejecting a listing");
    const listing = await AccommodationModel.findById(id); if (!listing) throw new AppError(404, "ACCOMMODATION_NOT_FOUND", "Accommodation listing was not found");
    listing.status = status as any; listing.rejectionReason = status === "rejected" ? reason : undefined; listing.moderatedBy = new Types.ObjectId(adminId); listing.moderatedAt = new Date(); await listing.save(); return listing;
  },
  async reviews(status?: string) { return AccommodationReviewModel.find(status ? { status } : {}).populate("userId", "fullName email").populate("accommodationId", "title area").sort({ createdAt: -1 }).lean(); },
  async moderateReview(adminId: string, id: string, status: string) { ensure(id); const review = await AccommodationReviewModel.findByIdAndUpdate(id, { status, moderatedBy: adminId, moderatedAt: new Date() }, { new: true }); if (!review) throw new AppError(404, "REVIEW_NOT_FOUND", "Review was not found"); return review; },
  async reports(status?: string) { return AccommodationReportModel.find(status ? { status } : {}).populate("reportedBy", "fullName email").populate("accommodationId", "title area status").sort({ createdAt: -1 }).lean(); },
  async resolveReport(adminId: string, id: string, status: string, resolutionNote?: string) { ensure(id); const report = await AccommodationReportModel.findByIdAndUpdate(id, { status, resolutionNote, handledBy: adminId, handledAt: new Date() }, { new: true }); if (!report) throw new AppError(404, "REPORT_NOT_FOUND", "Report was not found"); return report; },
  async stats() { const [pendingListings, approvedListings, pendingReviews, pendingReports] = await Promise.all([AccommodationModel.countDocuments({status:"pending"}), AccommodationModel.countDocuments({status:"approved"}), AccommodationReviewModel.countDocuments({status:"pending"}), AccommodationReportModel.countDocuments({status:"pending"})]); return { pendingListings, approvedListings, pendingReviews, pendingReports }; },
};
