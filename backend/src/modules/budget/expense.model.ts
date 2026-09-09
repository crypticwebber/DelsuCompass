import { Schema, model, type InferSchemaType } from "mongoose";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "./budget.types.js";

const expenseSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  amount: { type: Number, required: true, min: 0.01 },
  category: { type: String, enum: EXPENSE_CATEGORIES, required: true, index: true },
  description: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
  spentAt: { type: Date, required: true, index: true },
  paymentMethod: { type: String, enum: PAYMENT_METHODS, default: "cash" },
  notes: { type: String, trim: true, maxlength: 500 },
}, { timestamps: true, versionKey: false });

expenseSchema.index({ userId: 1, spentAt: -1 });
expenseSchema.index({ userId: 1, category: 1, spentAt: -1 });
export type ExpenseDocument = InferSchemaType<typeof expenseSchema> & { _id: { toString(): string } };
export const ExpenseModel = model("Expense", expenseSchema);
