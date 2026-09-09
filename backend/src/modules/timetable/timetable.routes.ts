import { Router } from "express";
import { authenticate, requireRole } from "../auth/auth.middleware.js";
import { UserRole } from "../users/user.types.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createTimetableEntry,
  deleteTimetableEntry,
  getTimetableEntry,
  listTimetableEntries,
  updateTimetableEntry,
} from "./timetable.controller.js";
import {
  createTimetableEntrySchema,
  timetableEntryIdSchema,
  timetableListSchema,
  updateTimetableEntrySchema,
} from "./timetable.validator.js";

export const timetableRouter = Router();

timetableRouter.use(authenticate, requireRole(UserRole.STUDENT));
timetableRouter.get("/", validate(timetableListSchema), listTimetableEntries);
timetableRouter.post("/", validate(createTimetableEntrySchema), createTimetableEntry);
timetableRouter.get("/:id", validate(timetableEntryIdSchema), getTimetableEntry);
timetableRouter.patch("/:id", validate(updateTimetableEntrySchema), updateTimetableEntry);
timetableRouter.delete("/:id", validate(timetableEntryIdSchema), deleteTimetableEntry);
