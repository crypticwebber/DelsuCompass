import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CalendarDays, GraduationCap, Home, Landmark, MapPin, Search, ShieldCheck, Sparkles } from "lucide-react";
import { informationApi } from "./information.api";
import { PublicFooter, PublicHeader } from "@/components/public/PublicChrome";

const money = (n: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
const date = (d?: string) => d ? new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d)) : "";
const label = (x: string) => x.replaceAll("_", " ").replace(/\b\w/g, m => m.toUpperCase());

const categoryCards = [
  [GraduationCap, "Admissions & screening", "Post-UTME, admission and registration information."],
  [CalendarDays, "Important dates", "Academic, examination and deadline notices."],
  [MapPin, "Campus & Abraka", "Verified DELSU and useful Abraka locations."],
  [Home, "Accommodation guide", "Observed rent ranges from approved listings."],
] as const;

export function ExplorePage() {
  const q = useQuery({ queryKey: ["public-explore"], queryFn: informationApi.explore });
  const d = q.data;
  const [query, setQuery] = useState("");
  const [noticeCategory, setNoticeCategory] = useState("all");

  const notices = useMemo(() => {
    const source = [...(d?.featured ?? []), ...(d?.latest ?? [])].filter((x, i, arr) => arr.findIndex(y => y.id === x.id) === i);
    const needle = query.trim().toLowerCase();
    return source.filter(x => {
      const matchesCategory = noticeCategory === "all" || x.category === noticeCategory;
      const matchesQuery = !needle || `${x.title} ${x.summary} ${x.category}`.toLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [d, query, noticeCategory]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />

      <section className="relative overflow-hidden bg-blue-950 px-5 py-12 text-white md:py-16 lg:px-8">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-600/25 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3.5 py-2 text-xs font-semibold text-blue-100"><Sparkles className="h-3.5 w-3.5" /> Public DELSU information hub</span>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-[-.045em] md:text-5xl lg:text-[3.6rem]">Start with the information you normally have to ask around for.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100/75">Browse administrator-managed notices, practical student guides, verified places around DELSU and Abraka, and accommodation price summaries without logging in.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-400">Create student account <ArrowRight className="h-4 w-4" /></Link>
              <a href="#notices" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/7 px-5 py-3 text-sm font-semibold text-white hover:bg-white/12">Browse updates</a>
            </div>
          </div>
          <div className="relative"><img src="https://images.pexels.com/photos/5965612/pexels-photo-5965612.jpeg?auto=compress&cs=tinysrgb&w=1500" alt="University campus buildings and student information environment" className="w-full rounded-[2rem] shadow-2xl shadow-blue-950/40" /></div>
        </div>
      </section>

      <section className="px-5 py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categoryCards.map(([Icon, title, text]) => <article key={title} className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></span><h2 className="mt-4 font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></article>)}
          </div>
        </div>
      </section>

      {q.isLoading ? (
        <div className="mx-auto max-w-7xl px-5 py-12 text-sm font-medium text-slate-500">Loading public information…</div>
      ) : (
        <div className="mx-auto max-w-7xl space-y-14 px-5 pb-16 lg:px-8">
          <section id="notices" className="scroll-mt-28">
            <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
              <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-700">Official updates</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.04em]">Find what matters right now.</h2><p className="mt-3 text-sm leading-6 text-slate-500">Search the notices published through the DELSU Compass administration panel.</p></div>
              <div className="rounded-3xl border border-blue-100 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3"><Search className="h-4 w-4 text-slate-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search notices, dates or categories" className="w-full bg-transparent text-sm outline-none" /></div>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {["all", "admission", "academic", "registration", "examination", "campus", "general"].map(c => <button key={c} onClick={() => setNoticeCategory(c)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold capitalize ${noticeCategory === c ? "bg-blue-700 text-white" : "bg-blue-50 text-blue-800 hover:bg-blue-100"}`}>{label(c)}</button>)}
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {notices.length ? notices.map(x => <article key={x.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase text-blue-700">{label(x.category)}</span>{x.importantDate && <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">{date(x.importantDate)}</span>}</div><h3 className="mt-4 text-lg font-semibold">{x.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{x.summary}</p>{x.sourceUrl && <a href={x.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700">{x.sourceLabel || "View source"}<ArrowRight className="h-3.5 w-3.5" /></a>}</article>) : <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50/45 p-8 md:col-span-2 lg:col-span-3"><p className="font-semibold text-blue-950">No matching notices found.</p><p className="mt-1 text-sm text-slate-500">Try a different search or category. If no notices have been published yet, administrators can add them without changing application code.</p></div>}
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
            <div className="overflow-hidden rounded-[2rem] bg-blue-950 p-5"><img src="https://images.pexels.com/photos/5965525/pexels-photo-5965525.jpeg?auto=compress&cs=tinysrgb&w=1400" alt="Students enjoying university campus life" className="w-full rounded-[1.5rem]" /><div className="p-4 text-white"><p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">Useful before and after admission</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.03em]">A student guide that can grow with the campus.</h2><p className="mt-3 text-sm leading-6 text-blue-100/70">Guides are administrator-managed so changing orientation information does not need to be hard-coded into the application.</p></div></div>
            <div>
              <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-600" /><h2 className="text-2xl font-semibold">Student guide</h2></div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {d?.guides.length ? d.guides.map(g => <article key={g.id} className="rounded-3xl border border-slate-200 bg-white p-5"><span className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">{label(g.category)}</span><h3 className="mt-2 text-lg font-semibold">{g.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{g.excerpt}</p><details className="mt-4 rounded-2xl bg-slate-50 p-3"><summary className="cursor-pointer text-xs font-semibold text-slate-800">Read guide</summary><p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{g.content}</p>{g.sourceUrl && <a className="mt-3 inline-flex text-xs font-semibold text-blue-700" href={g.sourceUrl} target="_blank" rel="noreferrer">{g.sourceLabel || "Source"}</a>}</details></article>) : <div className="rounded-3xl border border-dashed bg-white p-6 sm:col-span-2"><p className="font-semibold">No public guides published yet.</p><p className="mt-1 text-sm text-slate-500">Guide articles will appear here when administrators publish them.</p></div>}
              </div>
            </div>
          </section>

          <section className="rounded-[2.2rem] border border-blue-100 bg-blue-50/55 p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2"><Home className="h-5 w-5 text-blue-600" /><h2 className="text-2xl font-semibold">Accommodation price guide</h2></div><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">These are observed ranges calculated from approved DELSU Compass accommodation listings, not official university prices.</p></div><Link to="/register" className="text-sm font-semibold text-blue-700">Join to browse listings →</Link></div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {d?.accommodation.length ? d.accommodation.map(x => <div key={x.roomType} className="rounded-2xl border border-blue-100 bg-white p-5"><p className="text-xs font-semibold uppercase text-slate-500">{label(x.roomType)}</p><p className="mt-2 text-xl font-semibold">{money(x.minRent)} – {money(x.maxRent)}</p><p className="mt-1 text-xs text-slate-500">Average {money(x.averageRent)} · {x.count} approved listing{x.count === 1 ? "" : "s"}</p></div>) : <div className="rounded-2xl border border-dashed border-blue-200 bg-white/70 p-5 md:col-span-2 lg:col-span-3"><p className="text-sm font-medium text-slate-500">Price ranges will appear after accommodation listings have been approved.</p></div>}
            </div>
          </section>

          <section>
            <div className="grid gap-7 lg:grid-cols-[.65fr_1.35fr]">
              <div><div className="flex items-center gap-2"><Landmark className="h-5 w-5 text-blue-600" /><h2 className="text-2xl font-semibold">Verified places</h2></div><p className="mt-3 text-sm leading-6 text-slate-500">Curated campus and Abraka places can later be opened in Compass Map after signing in.</p><div className="mt-5 rounded-3xl border border-blue-100 bg-white p-5"><ShieldCheck className="h-5 w-5 text-blue-600" /><p className="mt-3 text-sm font-semibold">Verified location records</p><p className="mt-1 text-xs leading-5 text-slate-500">Locations shown here are managed by administrators instead of being invented in the frontend.</p></div></div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {d?.locations.length ? d.locations.map(x => <article key={x._id} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><MapPin className="h-4 w-4" /></span><div><p className="font-semibold">{x.name}</p><p className="mt-1 text-xs font-medium capitalize text-slate-400">{x.category} · {x.area}{x.campusSite ? ` · ${x.campusSite}` : ""}</p>{x.description && <p className="mt-2 text-sm leading-5 text-slate-600">{x.description}</p>}</div></div></article>) : <div className="rounded-2xl border border-dashed bg-white p-6 sm:col-span-2 lg:col-span-3"><p className="text-sm text-slate-500">Verified locations will appear here after they are added by an administrator.</p></div>}
              </div>
            </div>
          </section>

          <section className="flex flex-col items-start justify-between gap-5 rounded-[2rem] bg-white p-7 shadow-sm sm:flex-row sm:items-center"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-700">Want the full experience?</p><h2 className="mt-2 text-2xl font-semibold">Turn public information into your personal campus workflow.</h2><p className="mt-2 text-sm text-slate-500">Create an account for timetable, reminders, map routing, budget, community, events and more.</p></div><Link to="/register" className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white">Create account <ArrowRight className="h-4 w-4" /></Link></section>
        </div>
      )}

      <PublicFooter />
    </main>
  );
}
