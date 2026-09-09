import { AccommodationModel } from "../accommodation/accommodation.model.js";
import { CommunityPostModel } from "../community/community.model.js";
import { EventModel } from "../events/event.model.js";
import { OpportunityModel } from "../opportunities/opportunity.model.js";
import { SafetyAlertModel } from "../safety/safety-alert.model.js";
import { LocationModel } from "../locations/location.model.js";
import { InformationNoticeModel } from "../information/information-notice.model.js";
import { GuideArticleModel } from "../information/guide-article.model.js";

function rx(q:string){return new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i")}

export const searchService={
 async search(q:string,kind?:string){
  const r=rx(q.trim());
  const now=new Date();
  const run=async(type:string,p:Promise<any[]>,map:(x:any)=>any)=>({type,items:(await p).map(map)});
  const jobs:any[]=[];
  const wants=(x:string)=>!kind||kind==="all"||kind===x;
  if(wants("accommodation"))jobs.push(run("accommodation",AccommodationModel.find({status:"approved",$or:[{title:r},{area:r},{description:r}]}).limit(8).lean(),x=>({id:String(x._id),title:x.title,subtitle:`${x.area} · ₦${Number(x.annualRent).toLocaleString()}/year`,description:x.description,link:`/app/accommodation?id=${x._id}`})));
  if(wants("community"))jobs.push(run("community",CommunityPostModel.find({status:"approved",$or:[{title:r},{body:r},{area:r}]}).limit(8).lean(),x=>({id:String(x._id),title:x.title,subtitle:x.category,description:x.body,link:`/app/community?id=${x._id}`})));
  if(wants("events"))jobs.push(run("events",EventModel.find({status:"approved",$or:[{title:r},{description:r},{venue:r},{organizer:r}]}).limit(8).lean(),x=>({id:String(x._id),title:x.title,subtitle:`${x.category} · ${x.venue}`,description:x.description,link:`/app/events?id=${x._id}`})));
  if(wants("opportunities"))jobs.push(run("opportunities",OpportunityModel.find({status:"approved",$or:[{title:r},{description:r},{provider:r},{eligibility:r},{location:r}]}).limit(8).lean(),x=>({id:String(x._id),title:x.title,subtitle:`${x.type} · ${x.provider}`,description:x.description,link:`/app/opportunities?id=${x._id}`})));
  if(wants("safety"))jobs.push(run("safety",SafetyAlertModel.find({status:"active",$or:[{title:r},{description:r},{area:r},{safetyAdvice:r}]}).limit(8).lean(),x=>({id:String(x._id),title:x.title,subtitle:`${x.severity} · ${x.area}`,description:x.description,link:`/app/safety?id=${x._id}`})));
  if(wants("locations"))jobs.push(run("locations",LocationModel.find({isActive:true,$or:[{name:r},{description:r},{area:r},{address:r}]}).limit(8).lean(),x=>({id:String(x._id),title:x.name,subtitle:`${x.category} · ${x.area}`,description:x.description||x.address||"Verified campus location",link:`/app/map?id=${x._id}`})));
  if(wants("information")){
   jobs.push(run("information",InformationNoticeModel.find({status:"published",audience:{$in:["students","all","public"]},$and:[{$or:[{expiresAt:null},{expiresAt:{$gt:now}}]},{$or:[{title:r},{summary:r},{content:r}]}]}).limit(8).lean(),x=>({id:String(x._id),title:x.title,subtitle:`Official notice · ${x.category}`,description:x.summary,link:"/explore"})));
   jobs.push(run("information",GuideArticleModel.find({isPublished:true,$or:[{title:r},{excerpt:r},{content:r}]}).limit(8).lean(),x=>({id:String(x._id),title:x.title,subtitle:`Guide · ${x.category}`,description:x.excerpt,link:"/explore"})));
  }
  const raw=await Promise.all(jobs);
  const merged=new Map<string,any[]>();
  for(const group of raw)merged.set(group.type,[...(merged.get(group.type)||[]),...group.items].slice(0,12));
  const groups=[...merged.entries()].map(([type,items])=>({type,items}));
  return {query:q,total:groups.reduce((n,g)=>n+g.items.length,0),groups};
 }
};
