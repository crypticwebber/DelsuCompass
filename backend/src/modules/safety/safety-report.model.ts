import { Schema, model, type InferSchemaType } from "mongoose";
import { SAFETY_CATEGORIES, SAFETY_REPORT_STATUSES, SAFETY_SEVERITIES } from "./safety.types.js";
const schema = new Schema({
  category:{type:String,enum:SAFETY_CATEGORIES,required:true,index:true},
  severity:{type:String,enum:SAFETY_SEVERITIES,required:true,index:true},
  description:{type:String,required:true,trim:true,minlength:10,maxlength:3000},
  locationName:{type:String,required:true,trim:true,maxlength:180},
  latitude:{type:Number,min:-90,max:90}, longitude:{type:Number,min:-180,max:180},
  incidentAt:{type:Date,required:true,index:true},
  status:{type:String,enum:SAFETY_REPORT_STATUSES,default:"pending",index:true},
  allowAnonymousPublicUse:{type:Boolean,default:true},
  submittedBy:{type:Schema.Types.ObjectId,ref:"User",required:true,index:true},
  reviewedBy:{type:Schema.Types.ObjectId,ref:"User"}, reviewedAt:{type:Date},
  resolutionNote:{type:String,trim:true,maxlength:800}
},{timestamps:true,versionKey:false});
schema.index({status:1,severity:1,createdAt:-1});
export type SafetyReportDocument=InferSchemaType<typeof schema>&{_id:{toString():string}};
export const SafetyReportModel=model("SafetyReport",schema);
