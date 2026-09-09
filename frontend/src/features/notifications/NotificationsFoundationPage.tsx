import { Bell } from "lucide-react";

export function NotificationsFoundationPage() {
  return (
    <section className="mx-auto max-w-4xl">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700"><Bell className="h-6 w-6" /></span>
        <h1 className="mt-6 text-3xl font-black tracking-tight">Notifications</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">This is the notification entry point for the student application. The notification data model, read/unread state and feature-triggered notifications are scheduled for the dedicated notifications phase.</p>
        <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-9 text-center"><Bell className="mx-auto h-6 w-6 text-slate-400" /><p className="mt-3 font-bold">No notifications to display</p><p className="mt-1 text-sm text-slate-500">Notifications will appear here as connected features are implemented.</p></div>
      </div>
    </section>
  );
}
