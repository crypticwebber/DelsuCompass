import { Router } from "express";
import { authenticate, requireRole } from "../auth/auth.middleware.js";
import { UserRole } from "../users/user.types.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as c from "./budget.controller.js";
import * as s from "./budget.validator.js";
export const budgetRouter=Router();budgetRouter.use(authenticate,requireRole(UserRole.STUDENT));
budgetRouter.get("/plan",validate(s.monthQuerySchema),c.getPlan);budgetRouter.put("/plan",validate(s.upsertPlanSchema),c.upsertPlan);budgetRouter.get("/summary",validate(s.monthQuerySchema),c.summary);budgetRouter.get("/expenses",validate(s.expenseListSchema),c.listExpenses);budgetRouter.post("/expenses",validate(s.createExpenseSchema),c.createExpense);budgetRouter.patch("/expenses/:id",validate(s.updateExpenseSchema),c.updateExpense);budgetRouter.delete("/expenses/:id",validate(s.expenseIdSchema),c.deleteExpense);
