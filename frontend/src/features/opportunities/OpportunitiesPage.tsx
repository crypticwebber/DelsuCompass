import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  AlertTriangle,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  ExternalLink,
  GraduationCap,
  MapPin,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
  X,
} from "lucide-react";

import { opportunityApi } from "./opportunity.api";

import type {
  Opportunity,
  OpportunityInput,
  OpportunityType,
} from "./opportunity.types";

/* =========================================================
   CONSTANTS
   ========================================================= */

const labels: Record<OpportunityType, string> = {
  scholarship: "Scholarship",
  internship: "Internship",
  job: "Job",
  volunteering: "Volunteering",
  competition: "Competition",
  training: "Training",
  grant: "Grant",
  other: "Other",
};

const typeStyles: Record<OpportunityType, string> = {
  scholarship: "bg-blue-50 text-blue-700 border-blue-100",
  internship: "bg-violet-50 text-violet-700 border-violet-100",
  job: "bg-emerald-50 text-emerald-700 border-emerald-100",
  volunteering: "bg-orange-50 text-orange-700 border-orange-100",
  competition: "bg-pink-50 text-pink-700 border-pink-100",
  training: "bg-cyan-50 text-cyan-700 border-cyan-100",
  grant: "bg-amber-50 text-amber-800 border-amber-100",
  other: "bg-slate-100 text-slate-700 border-slate-200",
};

const statusStyles: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  rejected: "bg-red-100 text-red-700",
};

const blank: OpportunityInput = {
  title: "",
  description: "",
  type: "scholarship",
  provider: "",
  deadline: "",
  eligibility: "",
  location: "",
  applicationUrl: "",
  imageUrls: [],
};

const inputClass =
  "mt-1.5 block w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

const err = (e: unknown) =>
  (e as any)?.response?.data?.error?.message ??
  "Something went wrong. Please try again.";

function formatDeadline(value?: string) {
  if (!value) return null;

  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(value?: string) {
  if (!value) return null;

  const deadline = new Date(value).getTime();

  const now = Date.now();

  return Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
}

/* =========================================================
   MODAL LOCK
   ========================================================= */

function useModalLock(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const oldOverflow = document.body.style.overflow;

    const oldPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = oldOverflow;

      document.body.style.paddingRight = oldPaddingRight;
    };
  }, [enabled]);
}

/* =========================================================
   PAGE
   ========================================================= */

export function OpportunitiesPage() {
  const qc = useQueryClient();

  const [type, setType] = useState("");

  const [search, setSearch] = useState("");

  const [mine, setMine] = useState(false);

  const [compose, setCompose] = useState<Opportunity | "new" | null>(null);

  const [notice, setNotice] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Opportunity | null>(null);

  const q = useQuery({
    queryKey: ["opportunities", mine, type, search],

    queryFn: () =>
      mine
        ? opportunityApi.mine()
        : opportunityApi.list({
            type: type || undefined,

            search: search || undefined,
          }),
  });

  const rows = q.data ?? [];

  const visible = useMemo(
    () =>
      mine && search
        ? rows.filter((item) =>
            `${item.title} ${item.description} ${item.provider}`
              .toLowerCase()
              .includes(search.toLowerCase()),
          )
        : rows,
    [mine, rows, search],
  );

  const del = useMutation({
    mutationFn: (id: string) => opportunityApi.remove(id),

    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: ["opportunities"],
      });

      setDeleteTarget(null);

      setNotice("Opportunity deleted.");
    },
  });

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="relative min-w-0 overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 p-5 text-white shadow-lg shadow-blue-950/10 sm:p-8">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-300/15 blur-3xl" />

        <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative flex min-w-0 flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-blue-100">
              <Sparkles className="h-3.5 w-3.5" />
              Student Opportunities
            </div>

            <h1 className="mt-4 max-w-2xl break-words text-3xl font-black tracking-[-.035em] sm:text-4xl">
              Find opportunities worth acting on.
            </h1>

            <p className="mt-3 max-w-2xl break-words text-sm leading-6 text-blue-100/80 sm:text-base">
              Discover approved scholarships, internships, jobs, training
              programmes, grants, competitions and volunteering opportunities
              relevant to DELSU students.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCompose("new")}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-black text-blue-900 shadow-lg transition hover:bg-blue-50 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Share opportunity
          </button>
        </div>
      </section>

      {/* =====================================================
          NOTICE
          ===================================================== */}

      {notice && (
        <div className="flex min-w-0 items-start justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">
          <span className="min-w-0 flex-1 break-words">{notice}</span>

          <button
            type="button"
            onClick={() => setNotice("")}
            className="shrink-0 rounded-lg p-1 hover:bg-blue-100"
            aria-label="Dismiss notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* =====================================================
          FILTER PANEL
          ===================================================== */}

      <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
          <div className="relative min-w-0">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scholarships, internships, jobs..."
              className="w-full min-w-0 rounded-2xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={mine}
            className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">All types</option>

            {Object.entries(labels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <div className="grid min-w-0 grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMine(false)}
              className={`min-w-0 rounded-xl px-3 py-2.5 text-xs font-black transition sm:px-4 sm:text-sm ${
                !mine ? "bg-white text-slate-950 shadow" : "text-slate-500"
              }`}
            >
              Discover
            </button>

            <button
              type="button"
              onClick={() => setMine(true)}
              className={`min-w-0 rounded-xl px-3 py-2.5 text-xs font-black transition sm:px-4 sm:text-sm ${
                mine ? "bg-white text-slate-950 shadow" : "text-slate-500"
              }`}
            >
              My submissions
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
          ===================================================== */}

      {q.isLoading ? (
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-3xl bg-slate-100"
            />
          ))}
        </div>
      ) : q.isError ? (
        <div className="break-words rounded-3xl border border-red-100 bg-red-50 p-6 text-sm font-bold text-red-700">
          {err(q.error)}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center sm:p-14">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            <Sparkles className="h-7 w-7" />
          </div>

          <h2 className="mt-4 text-lg font-black text-slate-950">
            No opportunities found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Try another search or filter, or share a useful opportunity for
            administrator review.
          </p>

          {!mine && (
            <button
              type="button"
              onClick={() => setCompose("new")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white"
            >
              <Plus className="h-4 w-4" />
              Share opportunity
            </button>
          )}
        </div>
      ) : (
        <div className="grid min-w-0 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => (
            <Card
              key={item._id}
              item={item}
              mine={mine}
              edit={() => setCompose(item)}
              remove={() => setDeleteTarget(item)}
              notice={setNotice}
            />
          ))}
        </div>
      )}

      {/* =====================================================
          FORM MODAL
          ===================================================== */}

      {compose && (
        <Form
          item={compose === "new" ? undefined : compose}
          close={() => setCompose(null)}
          done={() => {
            setCompose(null);

            setNotice("Opportunity submitted for administrator review.");

            void qc.invalidateQueries({
              queryKey: ["opportunities"],
            });
          }}
        />
      )}

      {/* =====================================================
          DELETE MODAL
          ===================================================== */}

      {deleteTarget && (
        <ConfirmDelete
          item={deleteTarget}
          busy={del.isPending}
          close={() => setDeleteTarget(null)}
          confirm={() => del.mutate(deleteTarget._id)}
        />
      )}
    </div>
  );
}

/* =========================================================
   OPPORTUNITY CARD
   ========================================================= */

function Card({
  item,
  mine,
  edit,
  remove,
  notice,
}: {
  item: Opportunity;
  mine: boolean;
  edit: () => void;
  remove: () => void;
  notice: (s: string) => void;
}) {
  const [report, setReport] = useState(false);

  const image = item.imageUrls?.[0];

  const remainingDays = daysUntil(item.deadline);

  const expired = remainingDays !== null && remainingDays < 0;

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {/* IMAGE / VISUAL HEADER */}

      <div className="relative aspect-[16/8] w-full shrink-0 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
        {image ? (
          <>
            <img
              src={image}
              alt={item.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-slate-950/10" />
          </>
        ) : (
          <>
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />

            <div className="absolute -bottom-10 left-10 h-24 w-24 rounded-full bg-cyan-300/10" />

            <div className="absolute inset-0 grid place-items-center">
              <GraduationCap className="h-12 w-12 text-white/80" />
            </div>
          </>
        )}

        <div className="absolute inset-x-0 top-0 flex min-w-0 items-start justify-between gap-2 p-3 sm:p-4">
          <span
            className={`max-w-[70%] truncate rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide shadow-sm ${typeStyles[item.type]}`}
          >
            {labels[item.type]}
          </span>

          {mine && (
            <span
              className={`max-w-[40%] truncate rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                statusStyles[item.status] ?? "bg-slate-100 text-slate-700"
              }`}
            >
              {item.status}
            </span>
          )}
        </div>
      </div>

      {/* BODY */}

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="min-w-0">
          <h2 className="line-clamp-2 break-words text-lg font-black leading-6 text-slate-950">
            {item.title}
          </h2>

          <p className="mt-2 flex min-w-0 items-center gap-2 text-xs font-bold text-slate-500">
            <BriefcaseBusiness className="h-4 w-4 shrink-0 text-blue-600" />

            <span className="min-w-0 truncate">{item.provider}</span>
          </p>
        </div>

        <p className="mt-4 line-clamp-3 min-w-0 break-words text-sm leading-6 text-slate-600">
          {item.description}
        </p>

        {/* DETAILS */}

        <div className="mt-4 grid min-w-0 gap-2.5 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
          {item.deadline && (
            <div className="flex min-w-0 items-start gap-2">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

              <div className="min-w-0">
                <p className="font-bold text-slate-700">Deadline</p>

                <p className="mt-0.5 break-words">
                  {formatDeadline(item.deadline)}

                  {remainingDays !== null && (
                    <span
                      className={`ml-1.5 font-bold ${
                        expired
                          ? "text-red-600"
                          : remainingDays <= 7
                            ? "text-amber-700"
                            : "text-slate-400"
                      }`}
                    >
                      {expired
                        ? "· Expired"
                        : remainingDays === 0
                          ? "· Today"
                          : `· ${remainingDays} day${remainingDays === 1 ? "" : "s"} left`}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {item.location && (
            <div className="flex min-w-0 items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

              <div className="min-w-0">
                <p className="font-bold text-slate-700">Location</p>

                <p className="mt-0.5 break-words">{item.location}</p>
              </div>
            </div>
          )}

          {item.eligibility && (
            <div className="flex min-w-0 items-start gap-2">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

              <div className="min-w-0">
                <p className="font-bold text-slate-700">Eligibility</p>

                <p className="mt-0.5 line-clamp-2 break-words leading-5">
                  {item.eligibility}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* REJECTION */}

        {item.status === "rejected" && item.rejectionReason && (
          <div className="mt-4 min-w-0 rounded-2xl border border-red-100 bg-red-50 p-3">
            <p className="break-words text-xs font-bold leading-5 text-red-700">
              <span className="font-black">Reason:</span> {item.rejectionReason}
            </p>
          </div>
        )}

        {/* ACTIONS */}

        <div className="mt-auto pt-5">
          <div className="flex min-w-0 flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            {item.applicationUrl && (
              <a
                href={item.applicationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl bg-blue-700 px-3 py-2 text-xs font-black text-white transition hover:bg-blue-800"
              >
                Apply / learn more
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
              </a>
            )}

            <div className="flex w-full min-w-0 flex-wrap gap-2 sm:ml-auto sm:w-auto">
              {mine ? (
                <>
                  <button
                    type="button"
                    onClick={edit}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50 sm:flex-none"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={remove}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-100 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-50 sm:flex-none"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setReport((value) => !value)}
                  className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black text-slate-500 transition hover:bg-slate-50"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Report
                </button>
              )}
            </div>
          </div>

          {report && (
            <Report
              id={item._id}
              done={() => {
                setReport(false);

                notice("Report sent to an administrator.");
              }}
            />
          )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   CREATE / EDIT FORM
   ========================================================= */

function Form({
  item,
  close,
  done,
}: {
  item?: Opportunity;
  close: () => void;
  done: () => void;
}) {
  useModalLock(true);

  const [v, setV] = useState<OpportunityInput>(
    item
      ? {
          title: item.title,

          description: item.description,

          type: item.type,

          provider: item.provider,

          deadline: item.deadline?.slice(0, 10) ?? "",

          eligibility: item.eligibility ?? "",

          location: item.location ?? "",

          applicationUrl: item.applicationUrl ?? "",

          imageUrls: item.imageUrls ?? [],
        }
      : blank,
  );

  const [localError, setLocalError] = useState("");

  const m = useMutation({
    mutationFn: () =>
      item ? opportunityApi.update(item._id, v) : opportunityApi.create(v),

    onSuccess: done,
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !m.isPending) {
        close();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, m.isPending]);

  const submit = () => {
    setLocalError("");

    if (v.title.trim().length < 4) {
      setLocalError("Opportunity title must be at least 4 characters.");

      return;
    }

    if (v.provider.trim().length < 2) {
      setLocalError("Enter the provider or organization.");

      return;
    }

    if (v.description.trim().length < 10) {
      setLocalError("Description must be at least 10 characters.");

      return;
    }

    if (v.applicationUrl && !/^https?:\/\//i.test(v.applicationUrl)) {
      setLocalError("Application URL must begin with http:// or https://.");

      return;
    }

    m.mutate();
  };

  const modal = (
    <div
      className="
        fixed left-0 top-0
        z-[9999]
        flex h-[100dvh] w-screen
        items-start justify-center
        overflow-hidden
        bg-slate-950/75
        px-3 py-3
        backdrop-blur-sm
        sm:items-center
        sm:px-5 sm:py-5
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="opportunity-form-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !m.isPending) {
          close();
        }
      }}
    >
      <div
        className="
          relative
          flex
          h-[calc(100dvh-1.5rem)]
          w-full
          min-w-0
          max-w-3xl
          flex-col
          overflow-hidden
          rounded-2xl
          border border-slate-200
          bg-white
          shadow-[0_25px_80px_rgba(15,23,42,0.42)]
          sm:h-auto
          sm:max-h-[calc(100dvh-2.5rem)]
          sm:rounded-3xl
        "
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* HEADER */}

        <header className="relative shrink-0 border-b border-slate-100 bg-white px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0 pr-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.14em] text-blue-700">
              <BriefcaseBusiness className="h-3.5 w-3.5" />
              Student opportunity
            </div>

            <h2
              id="opportunity-form-title"
              className="mt-2 break-words text-xl font-black tracking-tight text-slate-950 sm:text-2xl"
            >
              {item ? "Edit opportunity" : "Share an opportunity"}
            </h2>

            <p className="mt-1.5 max-w-xl break-words text-xs leading-5 text-slate-500 sm:text-sm">
              Student submissions are reviewed by an administrator before they
              become visible in Discover.
            </p>
          </div>

          <button
            type="button"
            onClick={close}
            disabled={m.isPending}
            aria-label="Close opportunity form"
            className="
              absolute right-4 top-4
              grid h-10 w-10
              place-items-center
              rounded-full
              border border-slate-200
              bg-white
              text-slate-500
              shadow-sm
              transition
              hover:bg-slate-100
              hover:text-slate-950
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* SCROLLABLE BODY */}

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div className="w-full min-w-0 p-5 sm:p-6">
            <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-700 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-black text-blue-950">
                    Share useful, verifiable opportunities
                  </p>

                  <p className="mt-1 break-words text-xs leading-5 text-blue-800/75">
                    Include enough information for another student to understand
                    the opportunity and verify how to apply.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <Field
                label="Title"
                value={v.title}
                set={(value) =>
                  setV({
                    ...v,
                    title: value,
                  })
                }
                placeholder="e.g. 2026 Software Engineering Internship"
              />

              <label className="block min-w-0 text-xs font-black text-slate-600">
                Type
                <select
                  value={v.type}
                  onChange={(e) =>
                    setV({
                      ...v,

                      type: e.target.value as OpportunityType,
                    })
                  }
                  className={inputClass}
                >
                  {Object.entries(labels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <Field
                label="Provider / organization"
                value={v.provider}
                set={(value) =>
                  setV({
                    ...v,
                    provider: value,
                  })
                }
                placeholder="Organization offering the opportunity"
              />

              <Field
                label="Deadline (optional)"
                type="date"
                value={v.deadline ?? ""}
                set={(value) =>
                  setV({
                    ...v,
                    deadline: value,
                  })
                }
              />

              <Field
                label="Location (optional)"
                value={v.location ?? ""}
                set={(value) =>
                  setV({
                    ...v,
                    location: value,
                  })
                }
                placeholder="Remote, Lagos, Abraka..."
              />

              <Field
                label="Application URL (optional)"
                type="url"
                value={v.applicationUrl ?? ""}
                set={(value) =>
                  setV({
                    ...v,
                    applicationUrl: value,
                  })
                }
                placeholder="https://..."
              />

              <label className="block min-w-0 text-xs font-black text-slate-600 sm:col-span-2">
                Eligibility{" "}
                <span className="font-medium text-slate-400">(optional)</span>
                <textarea
                  rows={3}
                  value={v.eligibility ?? ""}
                  onChange={(e) =>
                    setV({
                      ...v,

                      eligibility: e.target.value,
                    })
                  }
                  placeholder="Who can apply? Include level, course, skills or other requirements."
                  className={`${inputClass} resize-y leading-6`}
                />
              </label>

              <label className="block min-w-0 text-xs font-black text-slate-600 sm:col-span-2">
                Description
                <textarea
                  rows={7}
                  value={v.description}
                  onChange={(e) =>
                    setV({
                      ...v,

                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the opportunity, benefits, requirements and any important application information."
                  className={`${inputClass} resize-y leading-6`}
                />
              </label>
            </div>

            {/* ERROR */}

            {localError && (
              <p className="mt-5 min-w-0 break-words rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm font-bold leading-6 text-amber-800">
                {localError}
              </p>
            )}

            {m.error && (
              <p className="mt-5 min-w-0 break-words rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-bold leading-6 text-red-700">
                {err(m.error)}
              </p>
            )}

            <div className="h-3" />
          </div>
        </div>

        {/* FIXED FOOTER */}

        <footer className="shrink-0 border-t border-slate-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="hidden max-w-sm text-[11px] leading-5 text-slate-400 sm:block">
              The opportunity remains private until an administrator approves
              it.
            </p>

            <div className="flex min-w-0 flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={close}
                disabled={m.isPending}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submit}
                disabled={m.isPending}
                className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {m.isPending
                  ? "Submitting..."
                  : item
                    ? "Save changes"
                    : "Submit for review"}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

/* =========================================================
   FIELD
   ========================================================= */

function Field({
  label,
  value,
  set,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  set: (x: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block min-w-0 text-xs font-black text-slate-600">
      {label}

      <input
        type={type}
        value={value}
        onChange={(e) => set(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );
}

/* =========================================================
   REPORT PANEL
   ========================================================= */

function Report({ id, done }: { id: string; done: () => void }) {
  const [reason, setReason] = useState("Information is inaccurate");

  const [details, setDetails] = useState("");

  const m = useMutation({
    mutationFn: () =>
      opportunityApi.report(id, {
        reason,
        details,
      }),

    onSuccess: done,
  });

  return (
    <div className="mt-4 min-w-0 overflow-hidden rounded-2xl border border-red-100 bg-red-50 p-4">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />

        <div>
          <p className="text-xs font-black text-red-900">
            Report this opportunity
          </p>

          <p className="mt-0.5 text-[11px] leading-5 text-red-700/70">
            Reports are reviewed by an administrator.
          </p>
        </div>
      </div>

      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="mt-3 block w-full min-w-0 rounded-xl border border-red-200 bg-white p-2.5 text-sm"
      >
        <option>Information is inaccurate</option>

        <option>Opportunity has expired</option>

        <option>Potential scam</option>

        <option>Spam or advertising</option>
      </select>

      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        rows={3}
        placeholder="Optional details"
        className="mt-2 block w-full min-w-0 resize-y rounded-xl border border-red-200 bg-white p-2.5 text-sm"
      />

      {m.error && (
        <p className="mt-2 break-words text-xs font-bold text-red-700">
          {err(m.error)}
        </p>
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => m.mutate()}
          disabled={m.isPending}
          className="rounded-lg bg-red-700 px-3 py-2 text-xs font-black text-white transition hover:bg-red-800 disabled:opacity-50"
        >
          {m.isPending ? "Sending..." : "Send report"}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   DELETE CONFIRMATION
   ========================================================= */

function ConfirmDelete({
  item,
  busy,
  close,
  confirm,
}: {
  item: Opportunity;
  busy: boolean;
  close: () => void;
  confirm: () => void;
}) {
  useModalLock(true);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        close();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [busy, close]);

  const modal = (
    <div
      className="
        fixed left-0 top-0
        z-[10000]
        flex h-[100dvh] w-screen
        items-center justify-center
        overflow-hidden
        bg-slate-950/75
        px-3 py-3
        backdrop-blur-sm
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-opportunity-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          close();
        }
      }}
    >
      <div
        className="w-full min-w-0 max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.42)] sm:rounded-3xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="p-5 sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-700">
              <Trash2 className="h-5 w-5" />
            </span>

            <div className="min-w-0 flex-1">
              <h2
                id="delete-opportunity-title"
                className="break-words text-lg font-black text-slate-950"
              >
                Delete opportunity?
              </h2>

              <p className="mt-1 break-words text-sm leading-6 text-slate-500">
                This will permanently remove <strong>“{item.title}”</strong>.
                This action cannot be undone.
              </p>
            </div>

            <button
              type="button"
              onClick={close}
              disabled={busy}
              aria-label="Close"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={close}
            disabled={busy}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={confirm}
            disabled={busy}
            className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-800 disabled:opacity-50"
          >
            {busy ? "Deleting..." : "Delete opportunity"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
