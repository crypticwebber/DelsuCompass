import { Types } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { BudgetPlanModel } from "./budget-plan.model.js";
import { ExpenseModel } from "./expense.model.js";
import type { ExpenseCategory, PaymentMethod } from "./budget.types.js";

function monthRange(month:string){const [year,m]=month.split("-").map(Number);return {start:new Date(Date.UTC(year,m-1,1)),end:new Date(Date.UTC(year,m,1))};}
function validId(id:string){if(!Types.ObjectId.isValid(id))throw new AppError(404,"EXPENSE_NOT_FOUND","Expense was not found");}

type PlanInput={month:string;expectedIncome:number;spendingLimit:number;savingsGoal:number;categoryAllocations:{category:ExpenseCategory;amount:number}[];notes?:string};
type ExpenseInput={amount:number;category:ExpenseCategory;description:string;spentAt:Date;paymentMethod:PaymentMethod;notes?:string};

export const budgetService={
  async getPlan(userId:string,month:string){return BudgetPlanModel.findOne({userId,month}).lean();},
  async upsertPlan(userId:string,input:PlanInput){
    const seen=new Set<string>(); for(const a of input.categoryAllocations){if(seen.has(a.category))throw new AppError(400,"DUPLICATE_ALLOCATION","Each budget category can only be allocated once");seen.add(a.category);}
    return BudgetPlanModel.findOneAndUpdate({userId,month:input.month},{$set:{...input,userId}},{upsert:true,new:true,runValidators:true,setDefaultsOnInsert:true}).lean();
  },
  async listExpenses(userId:string,month:string,category?:string,search?:string){const {start,end}=monthRange(month);const q:any={userId,spentAt:{$gte:start,$lt:end}};if(category)q.category=category;if(search)q.description={$regex:search,$options:"i"};return ExpenseModel.find(q).sort({spentAt:-1,createdAt:-1}).lean();},
  async createExpense(userId:string,input:ExpenseInput){return ExpenseModel.create({...input,userId});},
  async updateExpense(userId:string,id:string,input:Partial<ExpenseInput>){validId(id);const row=await ExpenseModel.findOneAndUpdate({_id:id,userId},input,{new:true,runValidators:true});if(!row)throw new AppError(404,"EXPENSE_NOT_FOUND","Expense was not found");return row;},
  async removeExpense(userId:string,id:string){validId(id);const row=await ExpenseModel.findOneAndDelete({_id:id,userId});if(!row)throw new AppError(404,"EXPENSE_NOT_FOUND","Expense was not found");},
  async summary(userId:string,month:string){
    const {start,end}=monthRange(month);const [plan,agg,daily]=await Promise.all([
      BudgetPlanModel.findOne({userId,month}).lean(),
      ExpenseModel.aggregate([{$match:{userId:new Types.ObjectId(userId),spentAt:{$gte:start,$lt:end}}},{$group:{_id:"$category",total:{$sum:"$amount"},count:{$sum:1}}},{$sort:{total:-1}}]),
      ExpenseModel.aggregate([{$match:{userId:new Types.ObjectId(userId),spentAt:{$gte:start,$lt:end}}},{$group:{_id:{$dateToString:{format:"%Y-%m-%d",date:"$spentAt"}},total:{$sum:"$amount"}}},{$sort:{_id:1}}])
    ]);
    const totalSpent=agg.reduce((s:any,x:any)=>s+x.total,0);const spendingLimit=plan?.spendingLimit??0;const remaining=Math.max(spendingLimit-totalSpent,0);const overspent=Math.max(totalSpent-spendingLimit,0);
    return {month,plan,totalSpent,remaining,overspent,transactionCount:agg.reduce((s:any,x:any)=>s+x.count,0),byCategory:agg.map((x:any)=>({category:x._id,total:x.total,count:x.count})),daily:daily.map((x:any)=>({date:x._id,total:x.total}))};
  }
};
