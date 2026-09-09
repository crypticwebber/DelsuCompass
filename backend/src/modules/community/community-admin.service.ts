import { Types } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { CommunityPostModel } from "./community.model.js";
import { CommunityReportModel } from "./community-report.model.js";
function valid(id:string,msg="Item was not found"){if(!Types.ObjectId.isValid(id))throw new AppError(404,"NOT_FOUND",msg)}
export const communityAdminService={
 async posts(status?:string){const q=status&&status!=="undefined"?{status}:{};return CommunityPostModel.find(q).populate("submittedBy","fullName email faculty department level").sort({createdAt:-1}).limit(200).lean()},
 async moderate(adminId:string,id:string,status:string,reason?:string){valid(id);const p=await CommunityPostModel.findById(id);if(!p)throw new AppError(404,"COMMUNITY_POST_NOT_FOUND","Community post was not found");p.status=status as any;p.moderatedBy=new Types.ObjectId(adminId) as any;p.moderatedAt=new Date();p.rejectionReason=status==="rejected"?reason:undefined;await p.save();return p},
 async reports(status?:string){const q=status&&status!=="undefined"?{status}:{};return CommunityReportModel.find(q).populate("postId","title category status").populate("reportedBy","fullName email").sort({createdAt:-1}).limit(200).lean()},
 async resolveReport(adminId:string,id:string,status:string,note?:string){valid(id);const r=await CommunityReportModel.findById(id);if(!r)throw new AppError(404,"REPORT_NOT_FOUND","Community report was not found");r.status=status as any;r.resolutionNote=note;r.resolvedBy=new Types.ObjectId(adminId) as any;r.resolvedAt=new Date();await r.save();return r},
 async stats(){const [pending,approved,rejected,openReports]=await Promise.all([CommunityPostModel.countDocuments({status:"pending"}),CommunityPostModel.countDocuments({status:"approved"}),CommunityPostModel.countDocuments({status:"rejected"}),CommunityReportModel.countDocuments({status:"pending"})]);return{pending,approved,rejected,openReports}}
};
