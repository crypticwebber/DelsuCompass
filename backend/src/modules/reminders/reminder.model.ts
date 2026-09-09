import { Schema, model } from "mongoose";

export interface ReminderDocument {
  userId: Schema.Types.ObjectId;
  timetableEntryId: Schema.Types.ObjectId;
  title?: string;
  minutesBefore: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reminderSchema = new Schema<ReminderDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    timetableEntryId: { type: Schema.Types.ObjectId, ref: "TimetableEntry", required: true, index: true },
    title: { type: String, trim: true, maxlength: 120 },
    minutesBefore: { type: Number, required: true, min: 0, max: 10080, default: 15 },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

reminderSchema.index({ userId: 1, timetableEntryId: 1 }, { unique: true });

export const ReminderModel = model<ReminderDocument>("Reminder", reminderSchema);
