import { Types } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { ReminderModel } from "../reminders/reminder.model.js";
import { TimetableEntryModel } from "./timetable.model.js";

function ensureObjectId(id: string, resource = "Timetable entry") {
  if (!Types.ObjectId.isValid(id)) throw new AppError(404, "RESOURCE_NOT_FOUND", `${resource} was not found`);
}

function conflictFilter(userId: string, day: string, startTime: string, endTime: string, excludeId?: string) {
  return {
    userId,
    day,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };
}

export const timetableService = {
  async list(userId: string, filters: { day?: string; courseCode?: string }) {
    const query: Record<string, unknown> = { userId };
    if (filters.day) query.day = filters.day;
    if (filters.courseCode) query.courseCode = filters.courseCode.toUpperCase();
    return TimetableEntryModel.find(query).sort({ day: 1, startTime: 1 }).lean();
  },

  async getById(userId: string, id: string) {
    ensureObjectId(id);
    const entry = await TimetableEntryModel.findOne({ _id: id, userId }).lean();
    if (!entry) throw new AppError(404, "TIMETABLE_ENTRY_NOT_FOUND", "Timetable entry was not found");
    return entry;
  },

  async create(userId: string, input: Record<string, unknown>) {
    const { allowConflict, ...data } = input;
    const day = String(data.day);
    const startTime = String(data.startTime);
    const endTime = String(data.endTime);
    const conflict = await TimetableEntryModel.exists(conflictFilter(userId, day, startTime, endTime));
    if (conflict && !allowConflict) throw new AppError(409, "TIMETABLE_CONFLICT", "This class overlaps another class on your timetable");
    return TimetableEntryModel.create({ ...data, userId, source: data.source ?? "manual" });
  },

  async update(userId: string, id: string, input: Record<string, unknown>) {
    const { allowConflict, ...data } = input;
    ensureObjectId(id);
    const existing = await TimetableEntryModel.findOne({ _id: id, userId });
    if (!existing) throw new AppError(404, "TIMETABLE_ENTRY_NOT_FOUND", "Timetable entry was not found");

    const day = String(data.day ?? existing.day);
    const startTime = String(data.startTime ?? existing.startTime);
    const endTime = String(data.endTime ?? existing.endTime);
    if (endTime <= startTime) throw new AppError(400, "INVALID_CLASS_TIME", "End time must be later than start time");

    const conflict = await TimetableEntryModel.exists(conflictFilter(userId, day, startTime, endTime, id));
    if (conflict && !allowConflict) throw new AppError(409, "TIMETABLE_CONFLICT", "This class overlaps another class on your timetable");

    Object.assign(existing, data);
    await existing.save();
    return existing;
  },

  async remove(userId: string, id: string) {
    ensureObjectId(id);
    const deleted = await TimetableEntryModel.findOneAndDelete({ _id: id, userId });
    if (!deleted) throw new AppError(404, "TIMETABLE_ENTRY_NOT_FOUND", "Timetable entry was not found");
    await ReminderModel.deleteMany({ userId, timetableEntryId: id });
  },
};
