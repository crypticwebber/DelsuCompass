import { apiClient } from "@/services/api/axios";
import type { BudgetPlan,BudgetSummary,Expense,ExpenseInput } from "./budget.types";
type ApiResponse<T>={success:true;data:T;message?:string};
export const budgetApi={
 async getPlan(month:string){const {data}=await apiClient.get<ApiResponse<BudgetPlan|null>>("/budget/plan",{params:{month}});return data.data},
 async savePlan(input:BudgetPlan){const {data}=await apiClient.put<ApiResponse<BudgetPlan>>("/budget/plan",input);return data.data},
 async summary(month:string){const {data}=await apiClient.get<ApiResponse<BudgetSummary>>("/budget/summary",{params:{month}});return data.data},
 async expenses(month:string,filters:{category?:string;search?:string}={}){const {data}=await apiClient.get<ApiResponse<Expense[]>>("/budget/expenses",{params:{month,...filters}});return data.data},
 async createExpense(input:ExpenseInput){const {data}=await apiClient.post<ApiResponse<Expense>>("/budget/expenses",input);return data.data},
 async updateExpense(id:string,input:Partial<ExpenseInput>){const {data}=await apiClient.patch<ApiResponse<Expense>>(`/budget/expenses/${id}`,input);return data.data},
 async deleteExpense(id:string){await apiClient.delete(`/budget/expenses/${id}`)}
};
