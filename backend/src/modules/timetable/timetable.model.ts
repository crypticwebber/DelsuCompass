import { Schema, model } from "mongoose";
import { WEEK_DAYS, type WeekDay } from "./timetable.types.js";

export interface TimetableEntryDocument {
  userId: Schema.Types.ObjectId;
  courseCode: string;
  courseTitle: string;
  lecturer?: string;
  day: WeekDay;
  startTime: string;
  endTime: string;
  venue: string;
  color?: string;
  notes?: string;
  isCarryOver: boolean;
  sourceLevel?: number;
  source: "manual" | "imported_current_level" | "imported_carry_over";
  createdAt: Date;
  updatedAt: Date;
}

const timetableEntrySchema = new Schema<TimetableEntryDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 20 },
    courseTitle: { type: String, required: true, trim: true, maxlength: 120 },
    lecturer: { type: String, trim: true, maxlength: 120 },
    day: { type: String, enum: WEEK_DAYS, required: true, index: true },
    startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    venue: { type: String, required: true, trim: true, maxlength: 120 },
    color: { type: String, trim: true, maxlength: 30, default: "emerald" },
    notes: { type: String, trim: true, maxlength: 500 },
    isCarryOver: { type: Boolean, default: false, index: true },
    sourceLevel: { type: Number, min: 100, max: 700 },
    source: { type: String, enum: ["manual", "imported_current_level", "imported_carry_over"], default: "manual" },
  },
  { timestamps: true },
);

timetableEntrySchema.index({ userId: 1, day: 1, startTime: 1 });
timetableEntrySchema.index({ userId: 1, courseCode: 1 });

export const TimetableEntryModel = model<TimetableEntryDocument>("TimetableEntry", timetableEntrySchema);
