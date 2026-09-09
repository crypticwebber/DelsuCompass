import { Types } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { CommunityPostModel } from "./community.model.js";
import { CommunityReportModel } from "./community-report.model.js";
function valid(id:string){if(!Types.ObjectId.isValid(id)) throw new AppError(404,"COMMUNITY_POST_NOT_FOUND","Community post was not found")}
export const communityService={
 async listPublic(filters:Record<string,unknown>){const q:any={status:"approved"};if(filters.category)q.category=filters.category;if(filters.area)q.area={$regex:String(filters.area),$options:"i"};if(filters.search)q.$text={$search:String(filters.search)};return CommunityPostModel.find(q).populate("submittedBy","fullName faculty department level").sort({createdAt:-1}).limit(100).lean()},
 async getPublic(id:string){valid(id);const p=await CommunityPostModel.findOne({_id:id,status:"approved"}).populate("submittedBy","fullName faculty department level").lean();if(!p)throw new AppError(404,"COMMUNITY_POST_NOT_FOUND","Approved community post was not found");return p},
 async mine(userId:string){return CommunityPostModel.find({submittedBy:userId}).sort({createdAt:-1}).lean()},
 async create(userId:string,input:Record<string,unknown>){return CommunityPostModel.create({...input,submittedBy:userId,status:"pending"})},
 async updateMine(userId:string,id:string,input:Record<string,unknown>){valid(id);const p=await CommunityPostModel.findOne({_id:id,submittedBy:userId});if(!p)throw new AppError(404,"COMMUNITY_POST_NOT_FOUND","Your community post was not found");if(p.status==="archived")throw new AppError(409,"POST_ARCHIVED","Archived posts cannot be edited");Object.assign(p,input,{status:"pending",rejectionReason:undefined,moderatedBy:undefined,moderatedAt:undefined});await p.save();return p},
 async removeMine(userId:string,id:string){valid(id);const p=await CommunityPostModel.findOneAndDelete({_id:id,submittedBy:userId});if(!p)throw new AppError(404,"COMMUNITY_POST_NOT_FOUND","Your community post was not found");await CommunityReportModel.deleteMany({postId:id})},
 async report(userId:string,id:string,input:Record<string,unknown>){valid(id);if(!await CommunityPostModel.exists({_id:id,status:"approved"}))throw new AppError(404,"COMMUNITY_POST_NOT_FOUND","Approved community post was not found");if(await CommunityReportModel.exists({postId:id,reportedBy:userId,status:"pending"}))throw new AppError(409,"REPORT_EXISTS","You already have an open report for this post");return CommunityReportModel.create({...input,postId:id,reportedBy:userId})}
};
