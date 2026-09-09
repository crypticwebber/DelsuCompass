import type { RequestHandler } from "express";import { notificationService as s } from "./notification.service.js";
export const list:RequestHandler=async(req,res,next)=>{try{const data=await s.list(req.auth!.userId,req.query.unread==="true");res.json({success:true,data});}catch(e){next(e)}};
export const count:RequestHandler=async(req,res,next)=>{try{res.json({success:true,data:{unread:await s.unreadCount(req.auth!.userId)}});}catch(e){next(e)}};
export const readOne:RequestHandler=async(req,res,next)=>{try{res.json({success:true,data:await s.markRead(req.auth!.userId,String(req.params.id))});}catch(e){next(e)}};
export const readAll:RequestHandler=async(req,res,next)=>{try{await s.markAllRead(req.auth!.userId);res.json({success:true,message:"Notifications marked as read"});}catch(e){next(e)}};
