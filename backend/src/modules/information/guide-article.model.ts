import { Schema, model, type InferSchemaType } from "mongoose";
import { GUIDE_CATEGORIES } from "./information.types.js";
const schema=new Schema({
  title:{type:String,required:true,trim:true,minlength:3,maxlength:160,index:true},
  category:{type:String,enum:GUIDE_CATEGORIES,required:true,index:true},
  excerpt:{type:String,required:true,trim:true,minlength:10,maxlength:360},
  content:{type:String,required:true,trim:true,minlength:10,maxlength:7000},
  sourceUrl:{type:String,trim:true,maxlength:700},
  sourceLabel:{type:String,trim:true,maxlength:160},
  sortOrder:{type:Number,default:0,min:0,max:1000,index:true},
  isPublished:{type:Boolean,default:false,index:true},
  publishedBy:{type:Schema.Types.ObjectId,ref:"User"},
  publishedAt:{type:Date},
},{timestamps:true,versionKey:false});
schema.index({isPublished:1,category:1,sortOrder:1});
schema.index({title:"text",excerpt:"text",content:"text"});
export type GuideArticleDocument=InferSchemaType<typeof schema>&{_id:{toString():string}};
export const GuideArticleModel=model("GuideArticle",schema);
