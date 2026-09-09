import type { RequestHandler } from "express";
import { budgetService } from "./budget.service.js";
export const getPlan:RequestHandler=async(req,res,next)=>{try{res.json({success:true,data:await budgetService.getPlan(req.auth!.userId,String(req.query.month))});}catch(e){next(e)}};
export const upsertPlan:RequestHandler=async(req,res,next)=>{try{res.json({success:true,message:"Budget plan saved",data:await budgetService.upsertPlan(req.auth!.userId,req.body)});}catch(e){next(e)}};
export const listExpenses:RequestHandler=async(req,res,next)=>{try{res.json({success:true,data:await budgetService.listExpenses(req.auth!.userId,String(req.query.month),req.query.category?String(req.query.category):undefined,req.query.search?String(req.query.search):undefined)});}catch(e){next(e)}};
export const createExpense:RequestHandler=async(req,res,next)=>{try{res.status(201).json({success:true,message:"Expense recorded",data:await budgetService.createExpense(req.auth!.userId,req.body)});}catch(e){next(e)}};
export const updateExpense:RequestHandler=async(req,res,next)=>{try{res.json({success:true,message:"Expense updated",data:await budgetService.updateExpense(req.auth!.userId,String(req.params.id),req.body)});}catch(e){next(e)}};
export const deleteExpense:RequestHandler=async(req,res,next)=>{try{await budgetService.removeExpense(req.auth!.userId,String(req.params.id));res.json({success:true,message:"Expense deleted"});}catch(e){next(e)}};
export const summary:RequestHandler=async(req,res,next)=>{try{res.json({success:true,data:await budgetService.summary(req.auth!.userId,String(req.query.month))});}catch(e){next(e)}};
