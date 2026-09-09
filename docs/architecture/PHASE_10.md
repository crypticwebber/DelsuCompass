# Phase 10 — Student Budget Planner & Expense Tracking

Phase 10 replaces the budget placeholder with a private, student-only financial planning module.

## Scope
- Monthly budget plan
- Expected income, spending limit and savings goal
- Optional per-category allocations
- Daily expense CRUD
- Month/category/search filtering
- Monthly summary, remaining amount and overspend calculation
- Daily-spend and category-spend visual summaries

## Privacy
Budget plans and expenses are scoped by authenticated `userId`. There are intentionally no administrator budget endpoints. Administrator privileges elsewhere in DELSU Compass do not expose a student's personal financial records.

## Architecture
`BudgetPlan` stores one plan per student/month. `Expense` stores individual transactions. Summaries are calculated from expenses and the plan instead of persisting redundant totals.
