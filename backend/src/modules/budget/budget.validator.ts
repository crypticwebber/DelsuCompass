import { z } from "zod";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "./budget.types.js";

const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const id = z.string().min(1);
const allocation = z.object({ category: z.enum(EXPENSE_CATEGORIES), amount: z.coerce.number().min(0) });

export const upsertPlanSchema = z.object({ body: z.object({
  month,
  expectedIncome: z.coerce.number().min(0).default(0),
  spendingLimit: z.coerce.number().min(0),
  savingsGoal: z.coerce.number().min(0).default(0),
  categoryAllocations: z.array(allocation).max(EXPENSE_CATEGORIES.length).default([]),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
}) });

export const monthQuerySchema = z.object({ query: z.object({ month }) });
export const createExpenseSchema = z.object({ body: z.object({
  amount: z.coerce.number().positive(), category: z.enum(EXPENSE_CATEGORIES),
  description: z.string().trim().min(2).max(160), spentAt: z.coerce.date(),
  paymentMethod: z.enum(PAYMENT_METHODS).default("cash"), notes: z.string().trim().max(500).optional().or(z.literal("")),
}) });
export const updateExpenseSchema = z.object({ params: z.object({ id }), body: z.object({
  amount: z.coerce.number().positive().optional(), category: z.enum(EXPENSE_CATEGORIES).optional(),
  description: z.string().trim().min(2).max(160).optional(), spentAt: z.coerce.date().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(), notes: z.string().trim().max(500).optional(),
}).refine(v=>Object.keys(v).length>0,{message:"At least one field is required"}) });
export const expenseIdSchema = z.object({ params: z.object({ id }) });
export const expenseListSchema = z.object({ query: z.object({
  month, category: z.enum(EXPENSE_CATEGORIES).optional(), search: z.string().trim().max(100).optional(),
}) });
