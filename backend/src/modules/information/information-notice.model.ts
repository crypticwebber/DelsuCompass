import { Schema, model, type InferSchemaType } from "mongoose";
import { NOTICE_AUDIENCES, NOTICE_CATEGORIES, NOTICE_STATUSES } from "./information.types.js";
const schema = new Schema({
  title:{type:String,required:true,trim:true,minlength:4,maxlength:180,index:true},
  summary:{type:String,required:true,trim:true,minlength:10,maxlength:420},
  content:{type:String,required:true,trim:true,minlength:10,maxlength:6000},
  category:{type:String,enum:NOTICE_CATEGORIES,required:true,index:true},
  audience:{type:String,enum:NOTICE_AUDIENCES,default:"public",index:true},
  importantDate:{type:Date,index:true},
  sourceUrl:{type:String,trim:true,maxlength:700},
  sourceLabel:{type:String,trim:true,maxlength:160},
  isFeatured:{type:Boolean,default:false,index:true},
  status:{type:String,enum:NOTICE_STATUSES,default:"draft",index:true},
  publishedBy:{type:Schema.Types.ObjectId,ref:"User"},
  publishedAt:{type:Date,index:true},
  expiresAt:{type:Date,index:true},
},{timestamps:true,versionKey:false});
schema.index({status:1,audience:1,isFeatured:1,publishedAt:-1});
schema.index({title:"text",summary:"text",content:"text"});
export type InformationNoticeDocument=InferSchemaType<typeof schema>&{_id:{toString():string}};
export const InformationNoticeModel=model("InformationNotice",schema);
