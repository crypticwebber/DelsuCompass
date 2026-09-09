import type { RequestHandler } from "express";import { locationService } from "./location.service.js";
export const list:RequestHandler=async(req,res,next)=>{try{res.json({success:true,data:await locationService.list(req.query)})}catch(e){next(e)}};
export const get:RequestHandler=async(req,res,next)=>{try{res.json({success:true,data:await locationService.get(String(req.params.id))})}catch(e){next(e)}};
export const adminList:RequestHandler=async(_req,res,next)=>{try{res.json({success:true,data:await locationService.adminList()})}catch(e){next(e)}};
export const create:RequestHandler=async(req,res,next)=>{try{res.status(201).json({success:true,message:"Location created",data:await locationService.create(req.auth!.userId,req.body)})}catch(e){next(e)}};
export const update:RequestHandler=async(req,res,next)=>{try{res.json({success:true,message:"Location updated",data:await locationService.update(req.auth!.userId,String(req.params.id),req.body)})}catch(e){next(e)}};
export const remove:RequestHandler=async(req,res,next)=>{try{res.json({success:true,message:"Location disabled",data:await locationService.remove(req.auth!.userId,String(req.params.id))})}catch(e){next(e)}};
