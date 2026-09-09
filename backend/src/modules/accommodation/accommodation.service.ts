import { Types } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { AccommodationModel } from "./accommodation.model.js";
import { AccommodationReviewModel } from "./accommodation-review.model.js";
import { AccommodationReportModel } from "./accommodation-report.model.js";

function oid(id: string) { if (!Types.ObjectId.isValid(id)) throw new AppError(404, "ACCOMMODATION_NOT_FOUND", "Accommodation listing was not found"); }

async function reviewSummary(accommodationId: string) {
  const rows = await AccommodationReviewModel.aggregate([
    { $match: { accommodationId: new Types.ObjectId(accommodationId), status: "approved" } },
    { $group: { _id: null, count: { $sum: 1 }, average: { $avg: "$rating" }, priceFairness: { $avg: "$priceFairness" }, water: { $avg: "$water" }, electricity: { $avg: "$electricity" }, security: { $avg: "$security" }, environment: { $avg: "$environment" } } },
  ]);
  return rows[0] ?? { count: 0, average: null, priceFairness: null, water: null, electricity: null, security: null, environment: null };
}

export const accommodationService = {
  async listPublic(filters: Record<string, unknown>) {
    const query: Record<string, unknown> = { status: "approved" };
    if (filters.area) query.area = { $regex: String(filters.area), $options: "i" };
    if (filters.roomType) query.roomType = filters.roomType;
    if (filters.minPrice || filters.maxPrice) query.annualRent = { ...(filters.minPrice ? { $gte: Number(filters.minPrice) } : {}), ...(filters.maxPrice ? { $lte: Number(filters.maxPrice) } : {}) };
    if (filters.maxDistance) query.distanceToCampusKm = { $lte: Number(filters.maxDistance) };
    if (filters.search) query.$text = { $search: String(filters.search) };
    const sortMap: Record<string, Record<string, 1 | -1>> = { newest: { createdAt: -1 }, price_asc: { annualRent: 1 }, price_desc: { annualRent: -1 }, distance: { distanceToCampusKm: 1 } };
    const listings = await AccommodationModel.find(query).sort(sortMap[String(filters.sort ?? "newest")]).limit(100).lean();
    const enriched = await Promise.all(listings.map(async (listing) => ({ ...listing, reviewSummary: await reviewSummary(String(listing._id)) })));
    return enriched;
  },
  async getPublic(id: string) {
    oid(id); const listing = await AccommodationModel.findOne({ _id: id, status: "approved" }).lean();
    if (!listing) throw new AppError(404, "ACCOMMODATION_NOT_FOUND", "Approved accommodation listing was not found");
    const reviews = await AccommodationReviewModel.find({ accommodationId: id, status: "approved" }).populate("userId", "fullName").sort({ createdAt: -1 }).lean();
    return { ...listing, reviewSummary: await reviewSummary(id), reviews };
  },
  async listMine(userId: string) { return AccommodationModel.find({ submittedBy: userId }).sort({ createdAt: -1 }).lean(); },
  async create(userId: string, input: Record<string, unknown>) { return AccommodationModel.create({ ...input, submittedBy: userId, status: "pending" }); },
  async updateMine(userId: string, id: string, input: Record<string, unknown>) {
    oid(id); const listing = await AccommodationModel.findOne({ _id: id, submittedBy: userId });
    if (!listing) throw new AppError(404, "ACCOMMODATION_NOT_FOUND", "Your accommodation listing was not found");
    if (listing.status === "unavailable") throw new AppError(409, "LISTING_UNAVAILABLE", "Unavailable listings cannot be edited");
    Object.assign(listing, input, { status: "pending", rejectionReason: undefined, moderatedBy: undefined, moderatedAt: undefined });
    await listing.save(); return listing;
  },
  async removeMine(userId: string, id: string) {
    oid(id); const deleted = await AccommodationModel.findOneAndDelete({ _id: id, submittedBy: userId });
    if (!deleted) throw new AppError(404, "ACCOMMODATION_NOT_FOUND", "Your accommodation listing was not found");
    await Promise.all([AccommodationReviewModel.deleteMany({ accommodationId: id }), AccommodationReportModel.deleteMany({ accommodationId: id })]);
  },
  async createReview(userId: string, id: string, input: Record<string, unknown>) {
    oid(id); const listing = await AccommodationModel.exists({ _id: id, status: "approved" });
    if (!listing) throw new AppError(404, "ACCOMMODATION_NOT_FOUND", "Approved accommodation listing was not found");
    try { return await AccommodationReviewModel.create({ ...input, accommodationId: id, userId, status: "pending" }); }
    catch (error: any) { if (error?.code === 11000) throw new AppError(409, "REVIEW_EXISTS", "You have already reviewed this accommodation"); throw error; }
  },
  async report(userId: string, id: string, input: Record<string, unknown>) {
    oid(id); const listing = await AccommodationModel.exists({ _id: id, status: "approved" });
    if (!listing) throw new AppError(404, "ACCOMMODATION_NOT_FOUND", "Approved accommodation listing was not found");
    const existing = await AccommodationReportModel.exists({ accommodationId: id, reportedBy: userId, status: "pending" });
    if (existing) throw new AppError(409, "REPORT_EXISTS", "You already have an open report for this listing");
    return AccommodationReportModel.create({ ...input, accommodationId: id, reportedBy: userId });
  },
};
