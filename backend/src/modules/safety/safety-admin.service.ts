import { Types } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { SafetyAlertModel } from "./safety-alert.model.js";
import { SafetyReportModel } from "./safety-report.model.js";
function valid(id:string){if(!Types.ObjectId.isValid(id))throw new AppError(404,"NOT_FOUND","Safety item was not found")}
export const safetyAdminService={
 async reports(status?:string,severity?:string){const q:any={};if(status&&status!=="undefined")q.status=status;if(severity&&severity!=="undefined")q.severity=severity;return SafetyReportModel.find(q).populate("submittedBy","fullName email faculty department level").sort({createdAt:-1}).limit(200).lean()},
 async updateReport(adminId:string,id:string,status:string,resolutionNote?:string){valid(id);const r=await SafetyReportModel.findById(id);if(!r)throw new AppError(404,"SAFETY_REPORT_NOT_FOUND","Safety report was not found");r.status=status as any;r.resolutionNote=resolutionNote;r.reviewedBy=new Types.ObjectId(adminId) as any;r.reviewedAt=new Date();await r.save();return r},
 async alerts(status?:string){const q=status&&status!=="undefined"?{status}:{};return SafetyAlertModel.find(q).populate("sourceReportId","category severity locationName incidentAt status").populate("publishedBy","fullName email").sort({publishedAt:-1}).limit(200).lean()},
 async createAlert(adminId:string,input:Record<string,unknown>){if(input.sourceReportId){valid(String(input.sourceReportId));if(!await SafetyReportModel.exists({_id:input.sourceReportId}))throw new AppError(404,"SAFETY_REPORT_NOT_FOUND","Source report was not found")}return SafetyAlertModel.create({...input,publishedBy:adminId,publishedAt:new Date(),status:"active"})},
 async updateAlert(id:string,input:Record<string,unknown>){valid(id);const a=await SafetyAlertModel.findByIdAndUpdate(id,input,{new:true,runValidators:true});if(!a)throw new AppError(404,"SAFETY_ALERT_NOT_FOUND","Safety alert was not found");return a},
 async stats(){const [pendingReports,reviewingReports,criticalReports,activeAlerts]=await Promise.all([SafetyReportModel.countDocuments({status:"pending"}),SafetyReportModel.countDocuments({status:"reviewing"}),SafetyReportModel.countDocuments({status:{$in:["pending","reviewing"]},severity:"critical"}),SafetyAlertModel.countDocuments({status:"active"})]);return{pendingReports,reviewingReports,criticalReports,activeAlerts}}
};
