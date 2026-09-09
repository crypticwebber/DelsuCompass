import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Clock3,
  LocateFixed,
  MapPin,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";

import { safetyApi } from "./safety.api";

import type {
  SafetyAlert,
  SafetyCategory,
  SafetyReportInput,
  SafetySeverity,
} from "./safety.types";

/* =========================================================
   CONSTANTS
   ========================================================= */

const categories: Record<SafetyCategory, string> = {
  security: "Security",
  harassment: "Harassment",
  accident: "Accident",
  fire: "Fire",
  road_hazard: "Road hazard",
  lighting: "Poor lighting",
  suspicious_activity: "Suspicious activity",
  other: "Other",
};

const severities: SafetySeverity[] = ["low", "moderate", "high", "critical"];

const severityClass: Record<SafetySeverity, string> = {
  low: "bg-sky-50 text-sky-700",
  moderate: "bg-amber-50 text-amber-800",
  high: "bg-orange-50 text-orange-800",
  critical: "bg-red-50 text-red-700",
};

const inputClass =
  "mt-1.5 block w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

function err(e: unknown) {
  return (e as any)?.response?.data?.error?.message ?? "Something went wrong.";
}

/* =========================================================
   MODAL LOCK
   ========================================================= */

function useModalLock(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const previousOverflow = document.body.style.overflow;

    const previousPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;

      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [enabled]);
}

/* =========================================================
   PAGE
   ========================================================= */

export function SafetyPage() {
  const qc = useQueryClient();

  const [tab, setTab] = useState<"alerts" | "mine">("alerts");

  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [search, setSearch] = useState("");
  const [compose, setCompose] = useState(false);
  const [notice, setNotice] = useState("");

  const alerts = useQuery({
    queryKey: ["safety-alerts", category, severity, search],

    queryFn: () =>
      safetyApi.alerts({
        category: category || undefined,
        severity: severity || undefined,
        search: search || undefined,
      }),
  });

  const mine = useQuery({
    queryKey: ["safety-reports-mine"],
    queryFn: safetyApi.mine,
    enabled: tab === "mine",
  });

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="min-w-0 overflow-hidden rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
        <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">
              Safety Centre
            </p>

            <h1 className="mt-3 break-words text-3xl font-black">
              Stay informed. Report concerns responsibly.
            </h1>

            <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-slate-300">
              View administrator-approved safety alerts around DELSU and Abraka,
              or privately send a safety report for review.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCompose(true)}
            className="
              inline-flex min-h-11 w-full shrink-0
              items-center justify-center gap-2
              rounded-xl bg-blue-400
              px-5 py-3
              text-center text-sm font-black text-slate-950
              transition hover:bg-blue-300
              sm:w-auto
            "
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>Report a safety concern</span>
          </button>
        </div>

        <div className="mt-5 min-w-0 break-words rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100">
          <strong>Important:</strong> DELSU Compass is an information and
          moderation platform, not an emergency response service. For an
          immediate emergency, contact the appropriate university security or
          emergency service directly.
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
            aria-label="Dismiss notice"
            onClick={() => setNotice("")}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg transition hover:bg-blue-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* =====================================================
          NAVIGATION / FILTER AREA
          ===================================================== */}

      <section className="min-w-0 space-y-4">
        {/* TABS - OWN ROW */}

        <div className="min-w-0">
          <div className="grid w-full grid-cols-2 rounded-2xl bg-slate-100 p-1 sm:w-[290px]">
            <button
              type="button"
              onClick={() => setTab("alerts")}
              className={`
                flex h-10 min-w-0 items-center justify-center
                rounded-xl px-3
                text-sm font-black
                transition
                ${
                  tab === "alerts"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }
              `}
            >
              Safety alerts
            </button>

            <button
              type="button"
              onClick={() => setTab("mine")}
              className={`
                flex h-10 min-w-0 items-center justify-center
                rounded-xl px-3
                text-sm font-black
                transition
                ${
                  tab === "mine"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }
              `}
            >
              My reports
            </button>
          </div>
        </div>

        {/* FILTERS - SEPARATE ROW */}

        {tab === "alerts" && (
          <div
            className="
              grid min-w-0 gap-3
              sm:grid-cols-2
              xl:grid-cols-[minmax(0,1fr)_190px_170px]
            "
          >
            {/* SEARCH */}

            <div className="relative min-w-0 sm:col-span-2 xl:col-span-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search alerts by area or issue..."
                className="
                  block h-11 w-full min-w-0
                  rounded-xl
                  border border-slate-200
                  bg-white
                  py-2.5 pl-10 pr-4
                  text-sm text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-50
                "
              />
            </div>

            {/* CATEGORY */}

            <div className="min-w-0">
              <select
                aria-label="Filter safety alerts by category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="
                  block h-11 w-full min-w-0
                  rounded-xl
                  border border-slate-200
                  bg-white
                  px-3.5
                  text-sm font-bold text-slate-700
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-50
                "
              >
                <option value="">All categories</option>

                {Object.entries(categories).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* SEVERITY */}

            <div className="min-w-0">
              <select
                aria-label="Filter safety alerts by severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="
                  block h-11 w-full min-w-0
                  rounded-xl
                  border border-slate-200
                  bg-white
                  px-3.5
                  text-sm font-bold text-slate-700
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-50
                "
              >
                <option value="">All severity</option>

                {severities.map((item) => (
                  <option key={item} value={item} className="capitalize">
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          CONTENT
          ===================================================== */}

      {tab === "alerts" ? (
        <Alerts query={alerts} />
      ) : (
        <MyReports query={mine} />
      )}

      {/* =====================================================
          REPORT MODAL
          ===================================================== */}

      {compose && (
        <ReportModal
          close={() => setCompose(false)}
          done={() => {
            setCompose(false);
            setTab("mine");

            setNotice(
              "Safety report submitted privately for administrator review.",
            );

            void qc.invalidateQueries({
              queryKey: ["safety-reports-mine"],
            });
          }}
        />
      )}
    </div>
  );
}

/* =========================================================
   ALERT LIST
   ========================================================= */

function Alerts({ query }: { query: any }) {
  if (query.isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8">
        <p className="text-sm text-slate-500">
          Loading approved safety alerts...
        </p>
      </div>
    );
  }

  if (query.error) {
    return (
      <p className="break-words rounded-3xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">
        {err(query.error)}
      </p>
    );
  }

  const rows: SafetyAlert[] = query.data ?? [];

  if (!rows.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
        <ShieldCheck className="mx-auto h-9 w-9 text-blue-500" />

        <h2 className="mt-3 break-words font-black">
          No active alerts match your filters
        </h2>

        <p className="mt-1 break-words text-sm text-slate-500">
          Approved safety information will appear here when administrators
          publish it.
        </p>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
      {rows.map((alert) => (
        <article
          key={alert._id}
          className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-black capitalize ${
                severityClass[alert.severity]
              }`}
            >
              {alert.severity} priority
            </span>

            <span className="min-w-0 break-words text-xs font-bold text-slate-400">
              {categories[alert.category]}
            </span>
          </div>

          <h2 className="mt-4 break-words text-lg font-black text-slate-950">
            {alert.title}
          </h2>

          <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-600">
            {alert.description}
          </p>

          <div className="mt-4 flex min-w-0 flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-slate-500">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />

              <span className="break-words">{alert.area}</span>
            </span>

            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 shrink-0" />

              <span className="break-words">
                {new Date(alert.publishedAt).toLocaleString()}
              </span>
            </span>
          </div>

          {alert.safetyAdvice && (
            <div className="mt-4 min-w-0 rounded-2xl bg-blue-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-blue-800">
                Safety guidance
              </p>

              <p className="mt-1 break-words text-sm leading-6 text-blue-900">
                {alert.safetyAdvice}
              </p>
            </div>
          )}

          {alert.expiresAt && (
            <p className="mt-3 break-words text-[11px] text-slate-400">
              Scheduled to expire {new Date(alert.expiresAt).toLocaleString()}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}

/* =========================================================
   MY REPORTS
   ========================================================= */

function MyReports({ query }: { query: any }) {
  if (query.isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8">
        <p className="text-sm text-slate-500">Loading your safety reports...</p>
      </div>
    );
  }

  if (query.error) {
    return (
      <p className="break-words rounded-3xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">
        {err(query.error)}
      </p>
    );
  }

  const rows = query.data ?? [];

  if (!rows.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
        <ShieldAlert className="mx-auto h-9 w-9 text-slate-300" />

        <h2 className="mt-3 break-words font-black">
          You have not submitted a safety report
        </h2>

        <p className="mt-1 break-words text-sm text-slate-500">
          Reports are visible to authorized administrators, not directly
          published to students.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-3">
      {rows.map((report: any) => (
        <article
          key={report._id}
          className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-black capitalize ${
                  severityClass[report.severity as SafetySeverity]
                }`}
              >
                {report.severity}
              </span>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black capitalize text-slate-600">
                {report.status}
              </span>
            </div>

            <span className="shrink-0 text-xs text-slate-400">
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>

          <p className="mt-3 break-words text-xs font-black uppercase tracking-wide text-slate-500">
            {categories[report.category as SafetyCategory]} ·{" "}
            {report.locationName}
          </p>

          <p className="mt-2 break-words text-sm leading-6 text-slate-700">
            {report.description}
          </p>

          {report.resolutionNote && (
            <p className="mt-3 break-words rounded-xl bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-600">
              Administrator note: {report.resolutionNote}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}

/* =========================================================
   REPORT MODAL
   ========================================================= */

function ReportModal({ close, done }: { close: () => void; done: () => void }) {
  useModalLock(true);

  const now = new Date();

  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

  const [v, setV] = useState<SafetyReportInput>({
    category: "security",
    severity: "moderate",
    description: "",
    locationName: "",
    incidentAt: now.toISOString().slice(0, 16),
    allowAnonymousPublicUse: true,
  });

  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState("");

  const m = useMutation({
    mutationFn: () =>
      safetyApi.report({
        ...v,

        incidentAt: new Date(v.incidentAt).toISOString(),
      }),

    onSuccess: done,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !m.isPending && !locating) {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, m.isPending, locating]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationNote("This browser does not support location access.");

      return;
    }

    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      setLocationNote(
        "Location access requires HTTPS on deployed versions of DELSU Compass. You can still describe the location manually.",
      );

      return;
    }

    setLocating(true);
    setLocationNote("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setV((current) => ({
          ...current,

          latitude: position.coords.latitude,

          longitude: position.coords.longitude,

          locationName: current.locationName || "Current GPS location",
        }));

        setLocationNote(
          `Location attached with approximately ±${Math.round(
            position.coords.accuracy,
          )} m accuracy.`,
        );

        setLocating(false);
      },

      (error) => {
        if (error.code === 1) {
          setLocationNote(
            "Location permission was denied. You can still describe the location manually.",
          );
        } else if (error.code === 3) {
          setLocationNote(
            "Location request timed out. You can try again or describe the location manually.",
          );
        } else {
          setLocationNote(
            "Current location could not be determined. You can still describe it manually.",
          );
        }

        setLocating(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      },
    );
  };

  const busy = m.isPending || locating;

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
      aria-labelledby="safety-report-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
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
          max-w-2xl
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
        {/* =================================================
            HEADER
            ================================================= */}

        <header className="relative shrink-0 border-b border-slate-100 bg-white px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0 pr-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-red-700">
              <ShieldAlert className="h-3.5 w-3.5" />
              Safety report
            </div>

            <h2
              id="safety-report-title"
              className="mt-2 break-words text-xl font-black tracking-tight text-slate-950 sm:text-2xl"
            >
              Report a safety concern
            </h2>

            <p className="mt-1.5 max-w-xl break-words text-xs leading-5 text-slate-500 sm:text-sm">
              Your report goes privately to authorized administrators for
              review. It is not automatically published to other students.
            </p>
          </div>

          <button
            type="button"
            onClick={close}
            disabled={busy}
            aria-label="Close safety report"
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

        {/* =================================================
            SCROLLABLE BODY
            ================================================= */}

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div className="w-full min-w-0 p-5 sm:p-6">
            {/* IMPORTANT */}

            <div className="mb-6 min-w-0 break-words rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
              <strong>Not for immediate emergencies.</strong> DELSU Compass
              records and moderates safety information. If there is immediate
              danger, contact the appropriate security or emergency service
              directly.
            </div>

            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              {/* CATEGORY */}

              <label className="block min-w-0 text-xs font-black text-slate-600">
                Category
                <select
                  value={v.category}
                  onChange={(e) =>
                    setV({
                      ...v,

                      category: e.target.value as SafetyCategory,
                    })
                  }
                  className={inputClass}
                >
                  {Object.entries(categories).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              {/* SEVERITY */}

              <label className="block min-w-0 text-xs font-black text-slate-600">
                Severity
                <select
                  value={v.severity}
                  onChange={(e) =>
                    setV({
                      ...v,

                      severity: e.target.value as SafetySeverity,
                    })
                  }
                  className={inputClass}
                >
                  {severities.map((item) => (
                    <option key={item} value={item} className="capitalize">
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              {/* LOCATION */}

              <label className="block min-w-0 text-xs font-black text-slate-600 sm:col-span-2">
                Location
                <input
                  value={v.locationName}
                  onChange={(e) =>
                    setV({
                      ...v,

                      locationName: e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="e.g. Site II junction, Faculty of Computing gate"
                />
              </label>

              {/* GPS */}

              <div className="min-w-0 sm:col-span-2">
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={locating}
                  className="
                    inline-flex min-h-11 w-full
                    items-center justify-center gap-2
                    rounded-xl
                    border border-blue-200
                    bg-blue-50
                    px-4 py-2.5
                    text-center text-xs font-black text-blue-800
                    transition
                    hover:bg-blue-100
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    sm:w-auto
                  "
                >
                  <LocateFixed className="h-4 w-4 shrink-0" />

                  <span>
                    {locating
                      ? "Getting location…"
                      : "Attach my current location"}
                  </span>
                </button>

                {locationNote && (
                  <p className="mt-2 min-w-0 break-words text-xs font-semibold leading-5 text-slate-500">
                    {locationNote}
                  </p>
                )}

                {v.latitude !== undefined && v.longitude !== undefined && (
                  <div className="mt-3 min-w-0 rounded-xl bg-emerald-50 p-3">
                    <p className="flex min-w-0 items-start gap-2 break-words text-xs font-semibold leading-5 text-emerald-800">
                      <LocateFixed className="mt-0.5 h-4 w-4 shrink-0" />

                      <span>
                        Location coordinates attached successfully. They are
                        stored only with this safety report for administrator
                        map review.
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* DATE */}

              <label className="block min-w-0 text-xs font-black text-slate-600 sm:col-span-2">
                When did it happen?
                <input
                  type="datetime-local"
                  value={v.incidentAt}
                  onChange={(e) =>
                    setV({
                      ...v,

                      incidentAt: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </label>

              {/* DESCRIPTION */}

              <label className="block min-w-0 text-xs font-black text-slate-600 sm:col-span-2">
                What happened?
                <textarea
                  rows={6}
                  value={v.description}
                  onChange={(e) =>
                    setV({
                      ...v,

                      description: e.target.value,
                    })
                  }
                  className={`${inputClass} resize-y leading-6`}
                  placeholder="Describe what you observed clearly and avoid sharing unnecessary sensitive personal information."
                />
              </label>

              {/* PUBLIC USE */}

              <label className="flex min-w-0 items-start gap-3 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={v.allowAnonymousPublicUse ?? true}
                  onChange={(e) =>
                    setV({
                      ...v,

                      allowAnonymousPublicUse: e.target.checked,
                    })
                  }
                  className="mt-1 h-4 w-4 shrink-0"
                />

                <span className="min-w-0 break-words">
                  <strong>Allow anonymous public use:</strong> an administrator
                  may use the safety information to create a public alert
                  without displaying your identity.
                </span>
              </label>
            </div>

            {/* ERROR */}

            {m.error && (
              <p className="mt-5 min-w-0 break-words rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-bold leading-6 text-red-700">
                {err(m.error)}
              </p>
            )}

            <div className="h-3" />
          </div>
        </div>

        {/* =================================================
            FOOTER
            ================================================= */}

        <footer className="shrink-0 border-t border-slate-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <p className="hidden max-w-sm text-[11px] leading-5 text-slate-400 lg:block">
              Reports remain private until an administrator reviews them. Public
              alerts are created separately through moderation.
            </p>

            <div className="grid w-full min-w-0 grid-cols-2 gap-2 lg:ml-auto lg:flex lg:w-auto lg:items-center">
              <button
                type="button"
                onClick={close}
                disabled={busy}
                className="
                  inline-flex h-11 min-w-0
                  items-center justify-center
                  rounded-xl
                  border border-slate-200
                  bg-white
                  px-4
                  text-sm font-black text-slate-700
                  transition
                  hover:bg-slate-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  lg:min-w-[110px]
                "
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => m.mutate()}
                className="
                  inline-flex h-11 min-w-0
                  items-center justify-center
                  rounded-xl
                  bg-slate-950
                  px-4
                  text-center text-sm font-black text-white
                  transition
                  hover:bg-slate-800
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  lg:min-w-[180px]
                "
              >
                {m.isPending ? "Submitting..." : "Submit safety report"}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
