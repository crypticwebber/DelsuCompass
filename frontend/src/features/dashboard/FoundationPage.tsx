import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BellRing,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Home,
  MapPinned,
  ShieldCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { informationApi } from "@/features/public/information.api";
import { PublicFooter, PublicHeader } from "@/components/public/PublicChrome";

const featureCards = [
  [
    CalendarDays,
    "Plan your week",
    "Build your timetable, import schedules and set class reminders.",
  ],
  [
    Home,
    "Find a place",
    "Browse moderated accommodation listings and compare observed rent ranges.",
  ],
  [
    MapPinned,
    "Move with confidence",
    "Use verified locations, live positioning and in-app route guidance.",
  ],
  [
    ShieldCheck,
    "Stay informed",
    "See administrator-published safety alerts and report concerns privately.",
  ],
  [
    UsersRound,
    "Learn from students",
    "Discover moderated campus tips, services, transport and useful local knowledge.",
  ],
  [
    WalletCards,
    "Manage your money",
    "Track private expenses, plan a monthly budget and watch your spending.",
  ],
] as const;

const journey = [
  [
    "01",
    "Explore first",
    "Use the public information hub before creating an account.",
  ],
  [
    "02",
    "Create your student space",
    "Set up your profile and keep your campus tools in one place.",
  ],
  [
    "03",
    "Use Compass every day",
    "Move from classes to maps, updates, events and community information.",
  ],
];

export function FoundationPage() {
  const q = useQuery({
    queryKey: ["landing-explore"],
    queryFn: informationApi.explore,
  });
  const featured = (q.data?.featured ?? []).slice(0, 3);

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950">
      <PublicHeader />

      <section className="relative isolate px-5 py-12 md:py-16 lg:px-16 lg:py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_86%_16%,rgba(191,219,254,.75),transparent_28rem),radial-gradient(circle_at_8%_88%,rgba(224,242,254,.8),transparent_30rem)]" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.96fr_1.04fr] lg:items-center">
          <div className="compass-page-enter ">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-800">
              <span className="h-2 w-2 rounded-full bg-blue-600" /> Built for
              everyday DELSU student life
            </span>
            <h1 className="mt-6 max-w-3xl text-[2.8rem] font-semibold leading-[1.03] tracking-[-.055em] text-slate-950 sm:text-6xl lg:text-[4.25rem]">
              Campus life feels easier when{" "}
              <span className="text-blue-700">everything connects.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-sm sm:leading-8">
              DELSU Compass brings the tools students repeatedly need into one
              clear place — classes, accommodation, safety, campus navigation,
              events, opportunities, community knowledge and personal budgeting.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-700/15 hover:-translate-y-0.5 hover:bg-blue-800"
              >
                Create your space <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-5 py-3.5 text-sm font-semibold text-blue-900 shadow-sm hover:-translate-y-0.5 hover:bg-blue-50"
              >
                Explore DELSU first <BookOpen className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 text-sm text-slate-500 sm:grid-cols-3">
              {[
                "Public information",
                "Moderated content",
                "Private student tools",
              ].map((x) => (
                <div key={x} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span>{x}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative compass-page-enter">
            <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-blue-200/35 blur-3xl" />
            <img
              src="https://images.pexels.com/photos/5940845/pexels-photo-5940845.jpeg?auto=compress&cs=tinysrgb&w=1600"
              alt="University students walking across a modern campus"
              className="w-full rounded-[2.2rem] shadow-[0_30px_90px_rgba(30,64,175,.16)]"
            />
            <div className="absolute -bottom-5 left-5 hidden max-w-[240px] rounded-2xl border border-blue-100 bg-white/95 p-4 shadow-xl backdrop-blur sm:block">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <BellRing className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Your day, organised
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-900">
                    Classes, notices and reminders together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-blue-100 bg-blue-50/55 px-5 py-12 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-700">
              One student platform
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em] md:text-4xl">
              Less searching. More knowing what to do next.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
              Instead of depending on scattered chats, repeated questions and
              disconnected tools, Compass organises useful information around
              real student workflows.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {journey.map(([n, t, s]) => (
              <div
                key={n}
                className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-semibold text-blue-600">{n}</p>
                <p className="mt-3 font-semibold text-slate-950">{t}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-700">
              What Compass helps you do
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em] md:text-4xl">
              Built around the moments students actually face.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Each feature is intentionally practical and connected to the rest
              of the platform.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map(([Icon, title, text]) => (
              <article
                key={title}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2.4rem] bg-blue-950 lg:grid-cols-[1fr_.95fr]">
          <div className="p-7 text-white sm:p-10 lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">
              Campus intelligence that feels useful
            </p>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-.04em] md:text-4xl">
              Student knowledge, but with structure and moderation.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-blue-100/75">
              Compass lets students contribute tips, accommodation information
              and useful campus knowledge while administrators review what
              becomes public. Safety reports remain private unless an
              administrator publishes a separate public alert.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "Community tips and local knowledge",
                "Student-submitted accommodation",
                "Events and opportunities",
                "Private safety reporting",
              ].map((x) => (
                <div
                  key={x}
                  className="flex items-center gap-2 rounded-2xl bg-white/7 px-4 py-3 text-sm text-blue-50"
                >
                  <CheckCircle2 className="h-4 w-4 text-blue-300" /> {x}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-blue-900/30 p-5 lg:p-8">
            <img
              src="https://images.pexels.com/photos/5940711/pexels-photo-5940711.jpeg?auto=compress&cs=tinysrgb&w=1400"
              alt="Students collaborating together on campus"
              className="h-full w-full rounded-[1.8rem] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-blue-100 bg-slate-50 px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
            <img
              src="https://images.pexels.com/photos/5965650/pexels-photo-5965650.jpeg?auto=compress&cs=tinysrgb&w=1400"
              alt="University library and student information environment"
              className="w-full rounded-[2rem] shadow-xl shadow-blue-950/10"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-700">
                Public information hub
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em] md:text-4xl">
                Useful information even before you sign in.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Prospective and current students can browse
                administrator-managed notices, student guides, verified
                locations and accommodation price summaries without creating an
                account.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Admissions & screening",
                    "Current information published by administrators.",
                  ],
                  [
                    "Important dates",
                    "Academic and registration deadlines in one view.",
                  ],
                  ["Abraka orientation", "Useful places and campus guidance."],
                  ["Rent guidance", "Observed ranges from approved listings."],
                ].map(([t, s]) => (
                  <div
                    key={t}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <p className="text-sm font-semibold">{t}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{s}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/explore"
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-blue-700"
              >
                Open the information hub <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-700">
                Latest from DELSU
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-.04em]">
                Important updates, surfaced clearly.
              </h2>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700"
            >
              See everything <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {featured.length ? (
              featured.map((x) => (
                <article
                  key={x.id}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                    {x.category}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold group-hover:text-blue-800">
                    {x.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {x.summary}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50/50 p-6 md:col-span-3">
                <p className="font-semibold text-blue-950">
                  Official updates will appear here.
                </p>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                  Changing Post-UTME dates, cut-off marks and academic notices
                  are intentionally not fabricated or hard-coded. Administrators
                  publish verified information when it becomes available.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[2rem] border border-blue-100 bg-blue-50 p-7 sm:flex-row sm:items-center sm:p-9">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              Ready to make campus life easier?
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-.03em]">
              Create your DELSU Compass student space.
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Start with your account, then build your profile and everyday
              campus setup.
            </p>
          </div>
          <Link
            to="/register"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-blue-700 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/15"
          >
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
