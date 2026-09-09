import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { authenticate, requireRole } from "../auth/auth.middleware.js";
import { UserRole } from "../users/user.types.js";
import { createReminder, deleteReminder, listReminders, updateReminder } from "./reminder.controller.js";
import { createReminderSchema, reminderIdSchema, updateReminderSchema } from "./reminder.validator.js";

export const reminderRouter = Router();
reminderRouter.use(authenticate, requireRole(UserRole.STUDENT));
reminderRouter.get("/", listReminders);
reminderRouter.post("/", validate(createReminderSchema), createReminder);
reminderRouter.patch("/:id", validate(updateReminderSchema), updateReminder);
reminderRouter.delete("/:id", validate(reminderIdSchema), deleteReminder);
