import { Router } from "express";
import { authenticate, requireRole } from "../auth/auth.middleware.js";
import { UserRole } from "../users/user.types.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as c from "./accommodation.controller.js";
import * as s from "./accommodation.validator.js";

export const accommodationRouter = Router();
accommodationRouter.use(authenticate, requireRole(UserRole.STUDENT));
accommodationRouter.get("/", validate(s.publicAccommodationListSchema), c.listPublic);
accommodationRouter.get("/mine", c.listMine);
accommodationRouter.post("/", validate(s.createAccommodationSchema), c.createListing);
accommodationRouter.patch("/:id", validate(s.updateAccommodationSchema), c.updateListing);
accommodationRouter.delete("/:id", validate(s.accommodationIdSchema), c.deleteListing);
accommodationRouter.post("/:id/reviews", validate(s.createReviewSchema), c.createReview);
accommodationRouter.post("/:id/reports", validate(s.reportAccommodationSchema), c.reportListing);
accommodationRouter.get("/:id", validate(s.accommodationIdSchema), c.getPublic);

export const accommodationAdminRouter = Router();
accommodationAdminRouter.use(authenticate, requireRole(UserRole.ADMINISTRATOR));
accommodationAdminRouter.get("/stats", c.adminStats);
accommodationAdminRouter.get("/listings", validate(s.adminListingQuerySchema), c.adminListings);
accommodationAdminRouter.post("/listings", validate(s.createAccommodationSchema), c.adminCreateListing);
accommodationAdminRouter.patch("/listings/:id/moderate", validate(s.moderateListingSchema), c.moderateListing);
accommodationAdminRouter.get("/reviews", validate(s.adminReviewQuerySchema), c.adminReviews);
accommodationAdminRouter.patch("/reviews/:id/moderate", validate(s.moderateReviewSchema), c.moderateReview);
accommodationAdminRouter.get("/reports", validate(s.adminReportQuerySchema), c.adminReports);
accommodationAdminRouter.patch("/reports/:id/resolve", validate(s.resolveReportSchema), c.resolveReport);
