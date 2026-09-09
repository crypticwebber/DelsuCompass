import { Schema, model } from "mongoose";

const refreshSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    userAgent: { type: String },
    ipAddress: { type: String },
    revokedAt: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

export const RefreshSessionModel = model("RefreshSession", refreshSessionSchema);
