import { Schema, model, type InferSchemaType } from "mongoose";
import { SAFETY_ALERT_STATUSES, SAFETY_CATEGORIES, SAFETY_SEVERITIES } from "./safety.types.js";
const schema = new Schema({
  title:{type:String,required:true,trim:true,minlength:4,maxlength:160},
  description:{type:String,required:true,trim:true,minlength:10,maxlength:2500},
  category:{type:String,enum:SAFETY_CATEGORIES,required:true,index:true},
  severity:{type:String,enum:SAFETY_SEVERITIES,required:true,index:true},
  area:{type:String,required:true,trim:true,maxlength:180,index:true},
  safetyAdvice:{type:String,trim:true,maxlength:1200},
  status:{type:String,enum:SAFETY_ALERT_STATUSES,default:"active",index:true},
  sourceReportId:{type:Schema.Types.ObjectId,ref:"SafetyReport"},
  expiresAt:{type:Date,index:true}, publishedBy:{type:Schema.Types.ObjectId,ref:"User",required:true},
  publishedAt:{type:Date,default:Date.now,index:true}
},{timestamps:true,versionKey:false});
schema.index({status:1,severity:1,publishedAt:-1});
schema.index({title:"text",description:"text",area:"text",safetyAdvice:"text"});
export type SafetyAlertDocument=InferSchemaType<typeof schema>&{_id:{toString():string}};
export const SafetyAlertModel=model("SafetyAlert",schema);
