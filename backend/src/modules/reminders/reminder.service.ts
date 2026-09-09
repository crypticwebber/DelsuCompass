import { Types } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { TimetableEntryModel } from "../timetable/timetable.model.js";
import { ReminderModel } from "./reminder.model.js";

function ensureId(id: string) {
  if (!Types.ObjectId.isValid(id)) throw new AppError(404, "REMINDER_NOT_FOUND", "Reminder was not found");
}

export const reminderService = {
  async list(userId: string) {
    return ReminderModel.find({ userId }).populate("timetableEntryId").sort({ createdAt: -1 }).lean();
  },

  async create(userId: string, input: { timetableEntryId: string; title?: string; minutesBefore: number; enabled: boolean }) {
    if (!Types.ObjectId.isValid(input.timetableEntryId)) throw new AppError(404, "TIMETABLE_ENTRY_NOT_FOUND", "Timetable entry was not found");
    const classEntry = await TimetableEntryModel.findOne({ _id: input.timetableEntryId, userId });
    if (!classEntry) throw new AppError(404, "TIMETABLE_ENTRY_NOT_FOUND", "Timetable entry was not found");
    const duplicate = await ReminderModel.exists({ userId, timetableEntryId: input.timetableEntryId });
    if (duplicate) throw new AppError(409, "REMINDER_EXISTS", "A reminder already exists for this class");
    return ReminderModel.create({ ...input, userId });
  },

  async update(userId: string, id: string, input: Record<string, unknown>) {
    ensureId(id);
    const reminder = await ReminderModel.findOneAndUpdate({ _id: id, userId }, input, { new: true, runValidators: true }).populate("timetableEntryId");
    if (!reminder) throw new AppError(404, "REMINDER_NOT_FOUND", "Reminder was not found");
    return reminder;
  },

  async remove(userId: string, id: string) {
    ensureId(id);
    const deleted = await ReminderModel.findOneAndDelete({ _id: id, userId });
    if (!deleted) throw new AppError(404, "REMINDER_NOT_FOUND", "Reminder was not found");
  },
};
