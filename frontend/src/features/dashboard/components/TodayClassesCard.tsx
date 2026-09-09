import { useQuery } from "@tanstack/react-query";
import { BellRing, CalendarDays, ChevronRight, Clock3, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { timetableApi } from "@/features/timetable/timetable.api";
import { reminderApi } from "@/features/reminders/reminder.api";
import type { WeekDay } from "@/features/timetable/timetable.types";

const jsDayToWeekDay: Record<number, WeekDay> = { 0:"sunday",1:"monday",2:"tuesday",3:"wednesday",4:"thursday",5:"friday",6:"saturday" };

export function TodayClassesCard() {
  const timetable = useQuery({ queryKey:["timetable"], queryFn:timetableApi.list });
  const reminders = useQuery({ queryKey:["reminders"], queryFn:reminderApi.list });
  const today = jsDayToWeekDay[new Date().getDay()];
  const entries = (timetable.data ?? []).filter((entry)=>entry.day===today).sort((a,b)=>a.startTime.localeCompare(b.startTime));
  const activeReminderIds = new Set((reminders.data ?? []).filter((r)=>r.enabled).map((r)=>r.timetableEntryId?._id));

  return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Today · {today}</p><h2 className="mt-1 text-lg font-black">Classes & reminders</h2></div><BellRing className="h-5 w-5 text-slate-400" /></div>{timetable.isLoading ? <div className="mt-5 h-28 animate-pulse rounded-2xl bg-slate-100"/> : entries.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center"><CalendarDays className="mx-auto h-7 w-7 text-slate-400"/><p className="mt-3 font-bold">No classes scheduled today</p><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">Add or review your weekly timetable to keep DELSU Compass up to date.</p><Link to="/app/timetable" className="mt-4 inline-flex text-sm font-bold text-blue-700">Open timetable <ChevronRight className="ml-1 h-4 w-4"/></Link></div> : <div className="mt-4 space-y-2">{entries.slice(0,3).map((entry)=><div key={entry._id} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5"><div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-xs font-black shadow-sm">{entry.courseCode.slice(0,2)}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="font-bold">{entry.courseCode}</p>{activeReminderIds.has(entry._id) && <BellRing className="h-3.5 w-3.5 text-blue-700"/>}</div><p className="truncate text-xs text-slate-500">{entry.courseTitle}</p><div className="mt-1.5 flex flex-wrap gap-3 text-xs font-semibold text-slate-500"><span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3"/>{entry.startTime}–{entry.endTime}</span><span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3"/>{entry.venue}</span></div></div></div>)}<Link to="/app/timetable" className="mt-3 inline-flex text-sm font-bold text-blue-700">View full timetable <ChevronRight className="ml-1 h-4 w-4"/></Link></div>}</div>;
}
