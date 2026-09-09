import { Types } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { UserModel } from "../users/user.model.js";
import { UserRole } from "../users/user.types.js";
import { AccommodationModel } from "../accommodation/accommodation.model.js";
import { AccommodationReviewModel } from "../accommodation/accommodation-review.model.js";
import { AccommodationReportModel } from "../accommodation/accommodation-report.model.js";
import { CommunityPostModel } from "../community/community.model.js";
import { CommunityReportModel } from "../community/community-report.model.js";
import { EventModel } from "../events/event.model.js";
import { EventReportModel } from "../events/event-report.model.js";
import { OpportunityModel } from "../opportunities/opportunity.model.js";
import { OpportunityReportModel } from "../opportunities/opportunity-report.model.js";
import { SafetyReportModel } from "../safety/safety-report.model.js";
import { SafetyAlertModel } from "../safety/safety-alert.model.js";
import { LocationModel } from "../locations/location.model.js";
import { RefreshSessionModel } from "../auth/refresh-session.model.js";

function ensureObjectId(id: string) {
  if (!Types.ObjectId.isValid(id)) throw new AppError(404, "USER_NOT_FOUND", "User was not found");
}

function publicAccount(user: any) {
  return {
    id: user._id.toString(), fullName: user.fullName, email: user.email, role: user.role,
    faculty: user.faculty, department: user.department, level: user.level, phoneNumber: user.phoneNumber,
    isVerified: user.isVerified, isActive: user.isActive, createdAt: user.createdAt, updatedAt: user.updatedAt,
  };
}

export const adminService = {
  async overview() {
    const [
      totalStudents, activeStudents, unverifiedStudents, disabledStudents, administrators,
      pendingAccommodation, pendingAccommodationReviews, accommodationReports,
      pendingCommunity, communityReports, pendingEvents, eventReports,
      pendingOpportunities, opportunityReports, pendingSafetyReports, criticalSafetyReports,
      activeSafetyAlerts, activeLocations, approvedAccommodation, approvedCommunity,
      approvedEvents, approvedOpportunities, recentStudents,
    ] = await Promise.all([
      UserModel.countDocuments({ role: UserRole.STUDENT }),
      UserModel.countDocuments({ role: UserRole.STUDENT, isActive: true }),
      UserModel.countDocuments({ role: UserRole.STUDENT, isVerified: false }),
      UserModel.countDocuments({ role: UserRole.STUDENT, isActive: false }),
      UserModel.countDocuments({ role: UserRole.ADMINISTRATOR, isActive: true }),
      AccommodationModel.countDocuments({ status: "pending" }),
      AccommodationReviewModel.countDocuments({ status: "pending" }),
      AccommodationReportModel.countDocuments({ status: "pending" }),
      CommunityPostModel.countDocuments({ status: "pending" }),
      CommunityReportModel.countDocuments({ status: "pending" }),
      EventModel.countDocuments({ status: "pending" }),
      EventReportModel.countDocuments({ status: "pending" }),
      OpportunityModel.countDocuments({ status: "pending" }),
      OpportunityReportModel.countDocuments({ status: "pending" }),
      SafetyReportModel.countDocuments({ status: { $in: ["pending", "reviewing"] } }),
      SafetyReportModel.countDocuments({ status: { $in: ["pending", "reviewing"] }, severity: "critical" }),
      SafetyAlertModel.countDocuments({ status: "active" }),
      LocationModel.countDocuments({ isActive: true }),
      AccommodationModel.countDocuments({ status: "approved" }),
      CommunityPostModel.countDocuments({ status: "approved" }),
      EventModel.countDocuments({ status: "approved" }),
      OpportunityModel.countDocuments({ status: "approved" }),
      UserModel.find({ role: UserRole.STUDENT }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return {
      users: { totalStudents, activeStudents, unverifiedStudents, disabledStudents, administrators },
      moderation: {
        pendingAccommodation, pendingAccommodationReviews, accommodationReports,
        pendingCommunity, communityReports, pendingEvents, eventReports,
        pendingOpportunities, opportunityReports, pendingSafetyReports, criticalSafetyReports,
      },
      publicContent: { approvedAccommodation, approvedCommunity, approvedEvents, approvedOpportunities, activeSafetyAlerts, activeLocations },
      recentStudents: recentStudents.map(publicAccount),
      generatedAt: new Date(),
    };
  },

  async users(query: { search?: string; status?: "active" | "disabled"; verified?: "true" | "false"; page?: number; limit?: number }) {
    const page = Number.isFinite(query.page) && Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number.isFinite(query.limit) && Number(query.limit) > 0 ? Math.min(Number(query.limit), 100) : 20;
    const filter: Record<string, unknown> = { role: UserRole.STUDENT };
    if (query.status) filter.isActive = query.status === "active";
    if (query.verified) filter.isVerified = query.verified === "true";
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      filter.$or = [{ fullName: regex }, { email: regex }, { department: regex }, { faculty: regex }];
    }
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      UserModel.countDocuments(filter),
    ]);
    return {
      items: items.map(publicAccount), total, page, limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  },

  async setUserStatus(adminId: string, userId: string, isActive: boolean) {
    ensureObjectId(userId);
    if (adminId === userId) throw new AppError(400, "SELF_STATUS_CHANGE_FORBIDDEN", "You cannot disable your own administrator account");
    const user = await UserModel.findOne({ _id: userId, role: UserRole.STUDENT });
    if (!user) throw new AppError(404, "USER_NOT_FOUND", "Student account was not found");
    user.isActive = isActive;
    await user.save();
    if (!isActive) await RefreshSessionModel.updateMany({ userId: user._id, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });
    return publicAccount(user);
  },
};
