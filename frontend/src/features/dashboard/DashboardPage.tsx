import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  House,
  MapPin,
  MapPinned,
  MessageSquareText,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider";
import { integrationApi } from "@/features/integration/integration.api";
import { getFirstName } from "@/lib/user";
import { QuickActionCard } from "./components/QuickActionCard";

const money = (value: number) => `₦${Number(value || 0).toLocaleString("en-NG")}`;
const dateTime = (value?: string) => value ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "No deadline";

export function DashboardPage() {
  const { user } = useAuth();
  const query = useQuery({ queryKey: ["integrated-dashboard"], queryFn: integrationApi.dashboard, refetchInterval: 60_000 });
  const data = query.data;
  const profileFields = [user?.fullName, user?.email, user?.department, user?.faculty, user?.level];
  const profileCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);
  const budgetUsed = data?.budget.spendingLimit ? Math.min(100, Math.round((data.budget.totalSpent / data.budget.spendingLimit) * 100)) : 0;

  return (
    <div className="space-y-6">
      {!user?.isVerified && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="font-bold">Verify your email address</p><p className="mt-0.5 text-sm text-amber-800">Verification helps keep student accounts and community contributions trustworthy.</p></div>
          <span className="shrink-0 text-sm font-semibold">Check your email</span>
        </div>
      )}

      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 p-6 text-white shadow-sm sm:p-8">
        <div className="grid gap-7 lg:grid-cols-[1.45fr_0.55fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-blue-300">Good to see you, {getFirstName(user?.fullName)}.</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">Today, without the campus guesswork.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100/80 sm:text-base">Your classes, important DELSU information, safety updates, money snapshot and student opportunities now meet in one daily view.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/app/timetable" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950">View timetable <ChevronRight className="h-4 w-4" /></Link>
              <Link to="/app/map" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10">Open Compass Map</Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/8 p-5">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Profile readiness</p><strong className="mt-2 block text-4xl font-black">{profileCompletion}%</strong></div><Link to="/app/notifications" className="relative grid h-11 w-11 place-items-center rounded-2xl bg-white/10"><Bell className="h-5 w-5"/>{(data?.unreadNotifications ?? 0)>0&&<span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-blue-400 px-1.5 py-0.5 text-center text-[10px] font-black text-slate-950">{data!.unreadNotifications}</span>}</Link></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-blue-400" style={{ width: `${profileCompletion}%` }} /></div>
            <p className="mt-3 text-xs leading-5 text-slate-400">Your faculty, department and level help Compass personalize timetable imports and student information.</p>
          </div>
        </div>
      </section>

      {query.isError && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">We could not refresh the dashboard right now. Please retry; your individual tools remain available.</div>}
      {!query.isError && (data?.partialFailures?.length ?? 0) > 0 && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">Some dashboard sections are temporarily unavailable: {data!.partialFailures!.join(", ")}. The rest of your dashboard is still live.</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <QuickActionCard title="Timetable" description="Classes, carry-over courses and reminders." to="/app/timetable" icon={CalendarDays} />
        <QuickActionCard title="Accommodation" description="Verified student housing around Abraka." to="/app/accommodation" icon={House} />
        <QuickActionCard title="Safety centre" description="Trusted alerts and private safety reporting." to="/app/safety" icon={ShieldCheck} />
        <QuickActionCard title="Campus map" description="Live location and turn-by-turn navigation." to="/app/map" icon={MapPinned} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-blue-700">Today</p><h2 className="mt-1 text-xl font-black">Classes</h2></div><Link to="/app/timetable" className="text-sm font-black text-blue-700">Full timetable</Link></div>
          <div className="mt-4 space-y-3">
            {query.isLoading ? <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Loading today's schedule…</p> : !data?.classes.length ? <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center"><BookOpen className="mx-auto h-6 w-6 text-blue-100/80"/><p className="mt-2 font-black">No classes scheduled today</p><p className="mt-1 text-sm text-slate-500">Add or import your timetable to personalize this view.</p></div> : data.classes.map(c => <div key={c._id} className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4"><div className="grid h-11 min-w-16 place-items-center rounded-xl bg-white text-xs font-black text-slate-800 shadow-sm">{c.startTime}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-black text-slate-950">{c.courseCode}</p>{c.isCarryOver&&<span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">Carry-over</span>}</div><p className="mt-1 truncate text-sm text-slate-600">{c.courseTitle}</p><p className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-400"><MapPin className="h-3.5 w-3.5"/>{c.venue} · {c.startTime}–{c.endTime}</p></div></div>)}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-sky-700">This month</p><h2 className="mt-1 text-xl font-black">Money snapshot</h2></div><Link to="/app/budget" className="text-sm font-black text-sky-700">Open budget</Link></div>
          <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-400">Spent</p><p className="mt-1 text-xl font-black">{money(data?.budget.totalSpent ?? 0)}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-400">Remaining</p><p className="mt-1 text-xl font-black">{money(data?.budget.remaining ?? 0)}</p></div></div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-sky-500" style={{width:`${budgetUsed}%`}}/></div>
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500"><span>{budgetUsed}% of spending limit used</span><span>{money(data?.budget.spendingLimit ?? 0)} limit</span></div>
          {(data?.budget.overspent ?? 0)>0&&<div className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">You are {money(data!.budget.overspent)} over your monthly spending limit.</div>}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <DashboardList title="Important DELSU information" eyebrow="Official notices" icon={Sparkles} link="/explore" empty="No current student notices." items={(data?.notices??[]).map(n=>({title:n.title,meta:n.importantDate?`Important: ${dateTime(n.importantDate)}`:n.category,body:n.summary}))}/>
        <DashboardList title="Upcoming around campus" eyebrow="Events" icon={CalendarDays} link="/app/events" empty="No upcoming approved events." items={(data?.events??[]).map(e=>({title:e.title,meta:dateTime(e.startDate),body:e.venue}))}/>
        <DashboardList title="Open opportunities" eyebrow="For students" icon={Target} link="/app/opportunities" empty="No active opportunities right now." items={(data?.opportunities??[]).map(o=>({title:o.title,meta:o.deadline?`Deadline ${dateTime(o.deadline)}`:"Open opportunity",body:o.provider}))}/>
      </section>

      {(data?.safetyAlerts.length ?? 0)>0 && <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-800"><ShieldAlert className="h-5 w-5"/></span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-amber-700">Safety centre</p><h2 className="mt-1 text-lg font-black text-amber-950">Active safety information</h2></div><Link to="/app/safety" className="text-sm font-black text-amber-800">View all</Link></div><div className="mt-4 grid gap-3 md:grid-cols-2">{data!.safetyAlerts.map(a=><Link key={a._id} to="/app/safety" className="rounded-2xl bg-white/75 p-4"><div className="flex items-center justify-between gap-2"><p className="font-black text-amber-950">{a.title}</p><span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black uppercase text-amber-800">{a.severity}</span></div><p className="mt-2 flex items-center gap-1 text-xs font-bold text-amber-800"><MapPin className="h-3.5 w-3.5"/>{a.area}</p></Link>)}</div></div></div></section>}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Your Compass</p><h2 className="mt-1 text-lg font-black">More student tools</h2><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{[["Budget & expenses","/app/budget",CircleDollarSign],["Community intelligence","/app/community",MessageSquareText],["Notifications","/app/notifications",Bell],["Find a place","/app/map",MapPin]].map(([label,to,Icon])=>{const I=Icon as typeof CircleDollarSign;return <Link key={String(to)} to={String(to)} className="flex items-center gap-3 rounded-2xl p-3 transition hover:bg-slate-50"><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-700"><I className="h-4 w-4"/></span><span className="flex-1 text-sm font-semibold">{String(label)}</span><ChevronRight className="h-4 w-4 text-slate-400"/></Link>})}</div></section>
    </div>
  );
}

function DashboardList({ title, eyebrow, icon: Icon, link, empty, items }: { title:string; eyebrow:string; icon:typeof CalendarDays; link:string; empty:string; items:{title:string;meta:string;body:string}[] }) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-2"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5"/></span><Link to={link} className="text-xs font-black text-blue-700">View all</Link></div><p className="mt-4 text-xs font-black uppercase tracking-[.16em] text-slate-400">{eyebrow}</p><h2 className="mt-1 text-lg font-black">{title}</h2><div className="mt-4 space-y-3">{items.length?items.slice(0,3).map((item,i)=><div key={`${item.title}-${i}`} className="border-t border-slate-100 pt-3 first:border-0 first:pt-0"><p className="line-clamp-1 text-sm font-black text-slate-900">{item.title}</p><p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-blue-700"><Clock3 className="h-3 w-3"/>{item.meta}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.body}</p></div>):<p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">{empty}</p>}</div></div>
}
