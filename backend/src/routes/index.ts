import { Router } from "express";
import mongoose from "mongoose";
import { authRouter } from "../modules/auth/auth.routes.js";
import { adminRouter } from "../modules/admin/admin.routes.js";
import { timetableRouter } from "../modules/timetable/timetable.routes.js";
import { reminderRouter } from "../modules/reminders/reminder.routes.js";
import { timetableImportRouter } from "../modules/timetable/import/timetable-import.routes.js";
import { userRouter } from "../modules/users/user.routes.js";
import { accommodationRouter, accommodationAdminRouter } from "../modules/accommodation/accommodation.routes.js";
import { communityRouter, communityAdminRouter } from "../modules/community/community.routes.js";
import { eventRouter, eventAdminRouter } from "../modules/events/event.routes.js";
import { opportunityRouter, opportunityAdminRouter } from "../modules/opportunities/opportunity.routes.js";
import { safetyRouter, safetyAdminRouter } from "../modules/safety/safety.routes.js";
import { locationRouter, locationAdminRouter } from "../modules/locations/location.routes.js";
import { navigationRouter } from "../modules/navigation/navigation.routes.js";
import { budgetRouter } from "../modules/budget/budget.routes.js";
import { notificationRouter } from "../modules/notifications/notification.routes.js";
import { searchRouter } from "../modules/search/search.routes.js";
import { informationRouter, informationAdminRouter } from "../modules/information/information.routes.js";
import { integrationRouter } from "../modules/integration/integration.routes.js";
import { mediaRouter } from "../modules/media/media.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  const databaseStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(200).json({
    success: true,
    message: "DELSU Compass API is running",
    data: { status: "healthy", database: databaseStatus, timestamp: new Date().toISOString() },
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/timetable/import", timetableImportRouter);
apiRouter.use("/timetable", timetableRouter);
apiRouter.use("/reminders", reminderRouter);
apiRouter.use("/accommodation", accommodationRouter);
apiRouter.use("/community", communityRouter);
apiRouter.use("/events", eventRouter);
apiRouter.use("/opportunities", opportunityRouter);
apiRouter.use("/safety", safetyRouter);
apiRouter.use("/locations", locationRouter);
apiRouter.use("/navigation", navigationRouter);
apiRouter.use("/budget", budgetRouter);
apiRouter.use("/notifications", notificationRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use("/information", informationRouter);
apiRouter.use("/integration", integrationRouter);
apiRouter.use("/media", mediaRouter);
apiRouter.use("/admin/accommodation", accommodationAdminRouter);
apiRouter.use("/admin/community", communityAdminRouter);
apiRouter.use("/admin/events", eventAdminRouter);
apiRouter.use("/admin/opportunities", opportunityAdminRouter);
apiRouter.use("/admin/safety", safetyAdminRouter);
apiRouter.use("/admin/locations", locationAdminRouter);
apiRouter.use("/admin/information", informationAdminRouter);
apiRouter.use("/admin", adminRouter);
