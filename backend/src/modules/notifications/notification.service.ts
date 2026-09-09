import { NotificationModel } from "./notification.model.js";
import { ReminderModel } from "../reminders/reminder.model.js";
import { TimetableEntryModel } from "../timetable/timetable.model.js";
import { AccommodationModel } from "../accommodation/accommodation.model.js";
import { CommunityPostModel } from "../community/community.model.js";
import { EventModel } from "../events/event.model.js";
import { OpportunityModel } from "../opportunities/opportunity.model.js";
import { SafetyAlertModel } from "../safety/safety-alert.model.js";
import { InformationNoticeModel } from "../information/information-notice.model.js";

const dayIndex:Record<string,number>={sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6};
function nextClassDate(day:string,time:string){const now=new Date();const [h,m]=time.split(":").map(Number);const target=new Date(now);target.setHours(h,m,0,0);let add=(dayIndex[day]-now.getDay()+7)%7;if(add===0&&target<=now)add=7;target.setDate(target.getDate()+add);return target;}
async function upsert(userId:string,p:any){await NotificationModel.updateOne({userId,sourceKey:p.sourceKey},{$setOnInsert:{userId,...p}},{upsert:true});}
export const notificationService={
 async sync(userId:string){
  const reminders=await ReminderModel.find({userId,enabled:true}).lean();
  const ids=reminders.map(r=>r.timetableEntryId); const entries=await TimetableEntryModel.find({_id:{$in:ids},userId}).lean(); const byId=new Map(entries.map(e=>[String(e._id),e]));
  for(const r of reminders){const e:any=byId.get(String(r.timetableEntryId));if(!e)continue;const cls=nextClassDate(e.day,e.startTime);const fire=new Date(cls.getTime()-r.minutesBefore*60000);const occurrence=cls.toISOString().slice(0,10);await upsert(userId,{type:"class_reminder",title:r.title||`${e.courseCode} class reminder`,message:`${e.courseCode} starts at ${e.startTime} in ${e.venue}.`,link:"/app/timetable",sourceKey:`reminder:${String(r._id)}:${occurrence}`,scheduledFor:fire,metadata:{courseCode:e.courseCode,minutesBefore:r.minutesBefore}})}
  const sources:any[]=[[AccommodationModel,"accommodation","/app/accommodation"],[CommunityPostModel,"community","/app/community"],[EventModel,"event","/app/events"],[OpportunityModel,"opportunity","/app/opportunities"]];
  for(const [Model,label,link] of sources){const docs:any[]=await Model.find({submittedBy:userId,status:{$in:["approved","rejected"]}}).sort({moderatedAt:-1}).limit(25).lean();for(const d of docs){await upsert(userId,{type:"moderation",title:`${label[0].toUpperCase()+label.slice(1)} ${d.status}`,message:d.status==="approved"?`Your ${label} submission “${d.title}” was approved.`:`Your ${label} submission “${d.title}” was rejected.${d.rejectionReason?` Reason: ${d.rejectionReason}`:" Please review the submission before resubmitting."}`,link,sourceKey:`moderation:${label}:${String(d._id)}:${d.status}`,scheduledFor:d.moderatedAt||d.updatedAt});}}
  const alerts:any[]=await SafetyAlertModel.find({status:"active",$or:[{expiresAt:null},{expiresAt:{$gt:new Date()}}]}).sort({publishedAt:-1}).limit(15).lean();for(const a of alerts){await upsert(userId,{type:"safety_alert",title:a.title,message:`${String(a.severity).toUpperCase()} · ${a.area}: ${a.description}`,link:"/app/safety",sourceKey:`safety:${String(a._id)}`,scheduledFor:a.publishedAt,metadata:{severity:a.severity,area:a.area}})}
  const now=new Date();
  const in24h=new Date(now.getTime()+24*60*60*1000);
  const in3d=new Date(now.getTime()+3*24*60*60*1000);
  const notices:any[]=await InformationNoticeModel.find({status:"published",audience:{$in:["students","all","public"]},$or:[{expiresAt:null},{expiresAt:{$gt:now}}]}).sort({publishedAt:-1}).limit(15).lean();
  for(const n of notices){await upsert(userId,{type:"official_notice",title:n.title,message:n.summary,link:"/explore",sourceKey:`official-notice:${String(n._id)}`,scheduledFor:n.publishedAt||n.createdAt,metadata:{category:n.category,importantDate:n.importantDate}})}
  const upcomingEvents:any[]=await EventModel.find({status:"approved",startDate:{$gte:now,$lte:in24h}}).sort({startDate:1}).limit(15).lean();
  for(const e of upcomingEvents){await upsert(userId,{type:"event_reminder",title:`Upcoming event: ${e.title}`,message:`${e.title} starts ${new Date(e.startDate).toLocaleString()} at ${e.venue}.`,link:"/app/events",sourceKey:`event-upcoming:${String(e._id)}:${new Date(e.startDate).toISOString().slice(0,10)}`,scheduledFor:now,metadata:{eventId:String(e._id),venue:e.venue,startDate:e.startDate}})}
  const deadlines:any[]=await OpportunityModel.find({status:"approved",deadline:{$gte:now,$lte:in3d}}).sort({deadline:1}).limit(15).lean();
  for(const o of deadlines){await upsert(userId,{type:"opportunity_deadline",title:`Deadline approaching: ${o.title}`,message:`${o.provider} · deadline ${new Date(o.deadline).toLocaleString()}.`,link:"/app/opportunities",sourceKey:`opportunity-deadline:${String(o._id)}:${new Date(o.deadline).toISOString().slice(0,10)}`,scheduledFor:now,metadata:{opportunityId:String(o._id),deadline:o.deadline}})}
 },
 async list(userId:string,unreadOnly=false){await this.sync(userId);return NotificationModel.find({userId,...(unreadOnly?{readAt:null}:{})}).sort({scheduledFor:-1,createdAt:-1}).limit(100).lean()},
 async unreadCount(userId:string){await this.sync(userId);return NotificationModel.countDocuments({userId,readAt:null,scheduledFor:{$lte:new Date()}})},
 async markRead(userId:string,id:string){return NotificationModel.findOneAndUpdate({_id:id,userId},{$set:{readAt:new Date()}},{new:true}).lean()},
 async markAllRead(userId:string){await NotificationModel.updateMany({userId,readAt:null,scheduledFor:{$lte:new Date()}},{$set:{readAt:new Date()}})}
};
