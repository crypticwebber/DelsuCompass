import { Types } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { SafetyAlertModel } from "./safety-alert.model.js";
import { SafetyReportModel } from "./safety-report.model.js";
function valid(id:string){if(!Types.ObjectId.isValid(id))throw new AppError(404,"SAFETY_ITEM_NOT_FOUND","Safety item was not found")}
async function expireOldAlerts(){await SafetyAlertModel.updateMany({status:"active",expiresAt:{$ne:null,$lte:new Date()}},{$set:{status:"expired"}})}
export const safetyService={
 async listAlerts(filters:Record<string,unknown>){await expireOldAlerts();const q:any={status:"active"};if(filters.category)q.category=filters.category;if(filters.severity)q.severity=filters.severity;if(filters.search)q.$text={$search:String(filters.search)};return SafetyAlertModel.find(q).sort({severity:-1,publishedAt:-1}).limit(100).lean()},
 async getAlert(id:string){valid(id);await expireOldAlerts();const a=await SafetyAlertModel.findOne({_id:id,status:"active"}).lean();if(!a)throw new AppError(404,"SAFETY_ALERT_NOT_FOUND","Active safety alert was not found");return a},
 async submitReport(userId:string,input:Record<string,unknown>){return SafetyReportModel.create({...input,submittedBy:userId,status:"pending"})},
 async myReports(userId:string){return SafetyReportModel.find({submittedBy:userId}).sort({createdAt:-1}).limit(100).lean()},
};
