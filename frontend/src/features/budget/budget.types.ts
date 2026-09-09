export const expenseCategories=["food","transport","accommodation","academics","data_airtime","utilities","health","entertainment","personal","other"] as const;
export type ExpenseCategory=(typeof expenseCategories)[number];
export type PaymentMethod="cash"|"bank_transfer"|"card"|"mobile_money"|"other";
export type BudgetPlan={_id?:string;month:string;expectedIncome:number;spendingLimit:number;savingsGoal:number;categoryAllocations:{category:ExpenseCategory;amount:number}[];notes?:string};
export type Expense={_id:string;amount:number;category:ExpenseCategory;description:string;spentAt:string;paymentMethod:PaymentMethod;notes?:string;createdAt:string;updatedAt:string};
export type BudgetSummary={month:string;plan:BudgetPlan|null;totalSpent:number;remaining:number;overspent:number;transactionCount:number;byCategory:{category:ExpenseCategory;total:number;count:number}[];daily:{date:string;total:number}[]};
export type ExpenseInput={amount:number;category:ExpenseCategory;description:string;spentAt:string;paymentMethod:PaymentMethod;notes?:string};
