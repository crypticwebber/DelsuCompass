import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BookOpen, BookOpenText, CalendarDays, CheckCheck, Clock3, ShieldAlert, Stamp, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { notificationApi } from "./notification.api";
import type { Notification } from "./notification.types";

const fmt = (value: string) => new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

function iconFor(type: Notification["type"]) {
  if (type === "class_reminder") return BookOpen;
  if (type === "moderation") return Stamp;
  if (type === "safety_alert") return ShieldAlert;
  if (type === "official_notice") return BookOpenText;
  if (type === "event_reminder") return CalendarDays;
  if (type === "opportunity_deadline") return Target;
  return Bell;
}

export function NotificationsPage() {
  const [unread, setUnread] = useState(false);
  const [notice, setNotice] = useState("");
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["notifications", unread], queryFn: () => notificationApi.list(unread), refetchInterval: 60_000 });
  const countQuery = useQuery({ queryKey: ["notification-count"], queryFn: notificationApi.count, refetchInterval: 60_000 });

  const invalidate = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["notifications"] }),
      qc.invalidateQueries({ queryKey: ["notification-count"] }),
      qc.invalidateQueries({ queryKey: ["integrated-dashboard"] }),
    ]);
  };

  const mark = useMutation({ mutationFn: notificationApi.read, onSuccess: invalidate });
  const all = useMutation({
    mutationFn: notificationApi.readAll,
    onSuccess: async () => {
      setNotice("All current notifications have been marked as read.");
      await invalidate();
    },
  });

  const now = Date.now();
  const items = (q.data || []).filter((n) => !n.scheduledFor || new Date(n.scheduledFor).getTime() <= now);
  const unreadCount = countQuery.data ?? items.filter((n) => !n.readAt).length;

  return <section className="mx-auto min-w-0 max-w-4xl space-y-6 overflow-x-hidden">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0"><p className="text-sm font-bold uppercase tracking-[.18em] text-blue-700">Your updates</p><h1 className="mt-2 text-3xl font-black tracking-tight">Notifications</h1><p className="mt-2 max-w-2xl text-slate-600">Class reminders, official notices, moderation decisions, safety updates, event reminders and opportunity deadlines.</p></div>
      <button type="button" onClick={() => all.mutate()} disabled={all.isPending || unreadCount === 0} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"><CheckCheck className="h-4 w-4" />{all.isPending ? "Marking…" : "Mark all as read"}</button>
    </div>

    {notice && <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">{notice}</div>}
    {(q.error || all.error || mark.error) && <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">We could not update notifications. Please try again.</div>}

    <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
      <button onClick={() => setUnread(false)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${!unread ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}>All</button>
      <button onClick={() => setUnread(true)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${unread ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}>Unread</button>
      <span className="ml-auto shrink-0 self-center text-xs font-bold text-slate-400">{unreadCount} unread</span>
    </div>

    {q.isLoading ? <div className="rounded-2xl bg-white p-8 text-center text-slate-500">Loading notifications…</div> : items.length === 0 ? <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center sm:p-12"><Bell className="mx-auto h-7 w-7 text-slate-400" /><p className="mt-3 font-bold">You're all caught up</p><p className="mt-1 text-sm text-slate-500">New reminders and platform updates will appear here.</p></div> : <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      {items.map((n) => {
        const Icon = iconFor(n.type);
        const content = <><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${n.type === "safety_alert" ? "bg-amber-50 text-amber-700" : n.type === "moderation" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"}`}><Icon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex min-w-0 items-start gap-2"><h2 className="min-w-0 break-words font-black text-slate-900">{n.title}</h2>{!n.readAt && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}</div><p className="mt-1 break-words text-sm leading-6 text-slate-600">{n.message}</p><p className="mt-2 flex items-center gap-1 text-xs text-slate-400"><Clock3 className="h-3.5 w-3.5" />{fmt(n.scheduledFor || n.createdAt)}</p></div></>;
        return <div key={n._id} onClick={() => !n.readAt && mark.mutate(n._id)} className={`border-b border-slate-100 p-4 last:border-b-0 sm:p-5 ${!n.readAt ? "bg-blue-50/25" : ""}`}>{n.link ? <Link to={n.link} className="flex min-w-0 gap-4">{content}</Link> : <div className="flex min-w-0 gap-4">{content}</div>}</div>;
      })}
    </div>}
  </section>;
}
