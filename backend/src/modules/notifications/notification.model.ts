import { Schema, model } from "mongoose";
import { NOTIFICATION_TYPES } from "./notification.types.js";
const schema=new Schema({userId:{type:Schema.Types.ObjectId,ref:"User",required:true,index:true},type:{type:String,enum:NOTIFICATION_TYPES,required:true,index:true},title:{type:String,required:true,trim:true,maxlength:160},message:{type:String,required:true,trim:true,maxlength:800},link:{type:String,trim:true,maxlength:300},sourceKey:{type:String,required:true,trim:true,maxlength:240},readAt:{type:Date,default:null,index:true},scheduledFor:{type:Date,index:true},metadata:{type:Schema.Types.Mixed}}, {timestamps:true,versionKey:false});
schema.index({userId:1,sourceKey:1},{unique:true});schema.index({userId:1,createdAt:-1});
export const NotificationModel=model("Notification",schema);
