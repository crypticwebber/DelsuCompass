import { AppError } from "../../utils/AppError.js";
import { AccommodationModel } from "../accommodation/accommodation.model.js";
import { LocationModel } from "../locations/location.model.js";
import { GuideArticleModel } from "./guide-article.model.js";
import { InformationNoticeModel } from "./information-notice.model.js";

const liveNoticeFilter=()=>({status:"published",audience:{$in:["public","all"]},$and:[{$or:[{expiresAt:{$exists:false}},{expiresAt:null},{expiresAt:{$gt:new Date()}}]}]});
const cleanDate=(v:any)=>v?new Date(v):undefined;
const serialize=(d:any)=>({id:d._id.toString(),...d.toObject(),_id:undefined});

export const informationService={
 async publicNotices(q:any={}){const filter:any=liveNoticeFilter();if(q.category)filter.category=q.category;if(q.featured==="true")filter.isFeatured=true;const limit=Math.min(Number(q.limit)||20,50);return (await InformationNoticeModel.find(filter).sort({isFeatured:-1,importantDate:1,publishedAt:-1}).limit(limit)).map(serialize);},
 async publicNotice(id:string){const d=await InformationNoticeModel.findOne({_id:id,...liveNoticeFilter()});if(!d)throw new AppError(404,"NOTICE_NOT_FOUND","Information notice not found");return serialize(d);},
 async publicGuides(q:any={}){const filter:any={isPublished:true};if(q.category)filter.category=q.category;return (await GuideArticleModel.find(filter).sort({category:1,sortOrder:1,publishedAt:-1})).map(serialize);},
 async publicGuide(id:string){const d=await GuideArticleModel.findOne({_id:id,isPublished:true});if(!d)throw new AppError(404,"GUIDE_NOT_FOUND","Guide article not found");return serialize(d);},
 async explore(){
   const [featured,latest,guides,locations,accommodation]=await Promise.all([
     InformationNoticeModel.find({...liveNoticeFilter(),isFeatured:true}).sort({publishedAt:-1}).limit(4),
     InformationNoticeModel.find(liveNoticeFilter()).sort({importantDate:1,publishedAt:-1}).limit(8),
     GuideArticleModel.find({isPublished:true}).sort({sortOrder:1,publishedAt:-1}).limit(8),
     LocationModel.find({isActive:true,isVerified:true}).sort({name:1}).limit(12),
     AccommodationModel.aggregate([{$match:{status:"approved"}},{$group:{_id:"$roomType",minRent:{$min:"$annualRent"},maxRent:{$max:"$annualRent"},averageRent:{$avg:"$annualRent"},count:{$sum:1}}},{$sort:{count:-1}},{$limit:8}]),
   ]);
   return {featured:featured.map(serialize),latest:latest.map(serialize),guides:guides.map(serialize),locations:locations.map(serialize),accommodation:accommodation.map((x:any)=>({roomType:x._id,minRent:x.minRent,maxRent:x.maxRent,averageRent:Math.round(x.averageRent||0),count:x.count}))};
 },
 async adminNotices(q:any={}){const f:any={};if(q.status)f.status=q.status;if(q.category)f.category=q.category;if(q.search)f.$text={$search:q.search};return (await InformationNoticeModel.find(f).sort({updatedAt:-1})).map(serialize);},
 async createNotice(adminId:string,b:any){const status=b.status||"draft";const d=await InformationNoticeModel.create({...b,importantDate:cleanDate(b.importantDate),expiresAt:cleanDate(b.expiresAt),publishedBy:status==="published"?adminId:undefined,publishedAt:status==="published"?new Date():undefined});return serialize(d);},
 async updateNotice(adminId:string,id:string,b:any){const d=await InformationNoticeModel.findById(id);if(!d)throw new AppError(404,"NOTICE_NOT_FOUND","Information notice not found");const wasPublished=d.status==="published";Object.assign(d,{...b,importantDate:b.importantDate!==undefined?cleanDate(b.importantDate):d.importantDate,expiresAt:b.expiresAt!==undefined?cleanDate(b.expiresAt):d.expiresAt});if(b.status==="published"&&!wasPublished){d.publishedBy=adminId as any;d.publishedAt=new Date();}await d.save();return serialize(d);},
 async adminGuides(q:any={}){const f:any={};if(q.category)f.category=q.category;return (await GuideArticleModel.find(f).sort({sortOrder:1,updatedAt:-1})).map(serialize);},
 async createGuide(adminId:string,b:any){const d=await GuideArticleModel.create({...b,publishedBy:b.isPublished?adminId:undefined,publishedAt:b.isPublished?new Date():undefined});return serialize(d);},
 async updateGuide(adminId:string,id:string,b:any){const d=await GuideArticleModel.findById(id);if(!d)throw new AppError(404,"GUIDE_NOT_FOUND","Guide article not found");const was=d.isPublished;Object.assign(d,b);if(b.isPublished===true&&!was){d.publishedBy=adminId as any;d.publishedAt=new Date();}await d.save();return serialize(d);},
};
