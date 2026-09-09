import { Schema, model, type InferSchemaType } from "mongoose";
import { UserRole } from "./user.types.js";

const userSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.STUDENT, index: true },
    profileImage: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    department: { type: String, trim: true },
    faculty: { type: String, trim: true },
    level: { type: Number, min: 100, max: 700 },
    isVerified: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    emailVerificationOtpHash: { type: String, select: false },
    emailVerificationExpiresAt: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    passwordChangedAt: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: { toString(): string } };
export const UserModel = model("User", userSchema);
