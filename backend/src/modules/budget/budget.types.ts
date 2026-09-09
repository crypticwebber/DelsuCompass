export const EXPENSE_CATEGORIES = ["food","transport","accommodation","academics","data_airtime","utilities","health","entertainment","personal","other"] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export const PAYMENT_METHODS = ["cash","bank_transfer","card","mobile_money","other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
