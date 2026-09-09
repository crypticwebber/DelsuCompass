import { Types } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { LocationModel } from "./location.model.js";
function valid(id:string){if(!Types.ObjectId.isValid(id))throw new AppError(404,"LOCATION_NOT_FOUND","Location was not found")}
export const locationService={
  async list(filters:Record<string,unknown>){const q:any={isActive:true};if(filters.category)q.category=filters.category;if(filters.area)q.area=new RegExp(String(filters.area),"i");if(filters.campusSite)q.campusSite=new RegExp(String(filters.campusSite),"i");if(filters.search)q.$text={$search:String(filters.search)};return LocationModel.find(q).sort({isVerified:-1,name:1}).limit(250).lean()},
  async get(id:string){valid(id);const row=await LocationModel.findOne({_id:id,isActive:true}).lean();if(!row)throw new AppError(404,"LOCATION_NOT_FOUND","Location was not found");return row},
  async adminList(){return LocationModel.find({}).sort({isActive:-1,isVerified:-1,name:1}).limit(500).lean()},
  async create(adminId:string,input:Record<string,unknown>){return LocationModel.create({...input,createdBy:adminId,updatedBy:adminId})},
  async update(adminId:string,id:string,input:Record<string,unknown>){valid(id);const row=await LocationModel.findByIdAndUpdate(id,{...input,updatedBy:adminId},{new:true,runValidators:true});if(!row)throw new AppError(404,"LOCATION_NOT_FOUND","Location was not found");return row},
  async remove(adminId:string,id:string){valid(id);const row=await LocationModel.findByIdAndUpdate(id,{isActive:false,updatedBy:adminId},{new:true});if(!row)throw new AppError(404,"LOCATION_NOT_FOUND","Location was not found");return row},
};
