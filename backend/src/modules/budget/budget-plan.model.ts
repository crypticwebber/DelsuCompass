import { Schema, model, type InferSchemaType } from "mongoose";
import { EXPENSE_CATEGORIES } from "./budget.types.js";

const categoryAllocationSchema = new Schema({
  category: { type: String, enum: EXPENSE_CATEGORIES, required: true },
  amount: { type: Number, required: true, min: 0 },
}, { _id: false });

const budgetPlanSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/, index: true },
  expectedIncome: { type: Number, required: true, min: 0, default: 0 },
  spendingLimit: { type: Number, required: true, min: 0 },
  savingsGoal: { type: Number, required: true, min: 0, default: 0 },
  categoryAllocations: { type: [categoryAllocationSchema], default: [] },
  notes: { type: String, trim: true, maxlength: 500 },
}, { timestamps: true, versionKey: false });

budgetPlanSchema.index({ userId: 1, month: 1 }, { unique: true });
export type BudgetPlanDocument = InferSchemaType<typeof budgetPlanSchema> & { _id: { toString(): string } };
export const BudgetPlanModel = model("BudgetPlan", budgetPlanSchema);
