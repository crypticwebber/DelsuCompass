import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  ExternalLink,
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  Search,
  X,
} from "lucide-react";

import { eventApi } from "./event.api";
import { mediaApi } from "@/features/media/media.api";
import type { CampusEvent, EventCategory, EventInput } from "./event.types";

/* =========================================================
   CONSTANTS
   ========================================================= */

const labels: Record<EventCategory, string> = {
  academic: "Academic",
  social: "Social",
  career: "Career",
  sports: "Sports",
  religious: "Religious",
  club: "Clubs",
  other: "Other",
};

const blank: EventInput = {
  title: "",
  description: "",
  category: "academic",
  startDate: "",
  endDate: "",
  venue: "",
  organizer: "",
  registrationUrl: "",
  imageUrls: [],
};

const readError = (e: unknown) =>
  (e as any)?.response?.data?.error?.message ??
  "Something went wrong. Please try again.";

function localDateTime(value?: string) {
  if (!value) return "";

  const d = new Date(value);
  const offset = d.getTimezoneOffset() * 60_000;

  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
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

export function EventsPage() {
  const qc = useQueryClient();

  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [mine, setMine] = useState(false);

  const [compose, setCompose] = useState<CampusEvent | "new" | null>(null);

  const [notice, setNotice] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<CampusEvent | null>(null);

  const q = useQuery({
    queryKey: ["events", mine, category, search],

    queryFn: () =>
      mine
        ? eventApi.mine()
        : eventApi.list({
            category: category || undefined,
            search: search || undefined,
          }),
  });

  const rows = q.data ?? [];

  const visible = useMemo(
    () =>
      mine && search
        ? rows.filter((event) =>
            `${event.title} ${event.description} ${event.venue}`
              .toLowerCase()
              .includes(search.toLowerCase()),
          )
        : rows,
    [mine, rows, search],
  );

  const del = useMutation({
    mutationFn: (id: string) => eventApi.remove(id),

    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: ["events"],
      });

      setDeleteTarget(null);
      setNotice("Event deleted.");
    },
  });

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="relative min-w-0 overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 p-5 text-white sm:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-300/15 blur-2xl" />

        <div className="relative flex min-w-0 flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[.2em] text-blue-200">
              Campus Events
            </p>

            <h1 className="mt-3 break-words text-3xl font-black tracking-[-.03em] sm:text-4xl">
              Know what is happening around DELSU.
            </h1>

            <p className="mt-3 max-w-2xl break-words text-sm leading-6 text-blue-100/80 sm:text-base">
              Discover approved academic, social, career, sports and student
              events. Share useful events with the community and track your
              moderation status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCompose("new")}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-black text-blue-900 shadow-lg transition hover:bg-blue-50 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Submit event
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
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* =====================================================
          FILTERS
          ===================================================== */}

      <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events, venues or organizers"
              className="w-full min-w-0 rounded-2xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={mine}
            className="w-full min-w-0 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold disabled:bg-slate-100"
          >
            <option value="">All categories</option>

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
              className={`min-w-0 rounded-xl px-3 py-2.5 text-xs font-black sm:px-4 sm:text-sm ${
                !mine ? "bg-white text-slate-950 shadow" : "text-slate-500"
              }`}
            >
              Discover
            </button>

            <button
              type="button"
              onClick={() => setMine(true)}
              className={`min-w-0 rounded-xl px-3 py-2.5 text-xs font-black sm:px-4 sm:text-sm ${
                mine ? "bg-white text-slate-950 shadow" : "text-slate-500"
              }`}
            >
              My submissions
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          RESULTS
          ===================================================== */}

      {q.isLoading ? (
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-3xl bg-slate-100"
            />
          ))}
        </div>
      ) : q.isError ? (
        <div className="break-words rounded-3xl border border-red-100 bg-red-50 p-6 text-sm font-bold text-red-700">
          {readError(q.error)}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center sm:p-12">
          <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />

          <h2 className="mt-3 font-black">No events found</h2>

          <p className="mt-2 text-sm text-slate-500">
            Try another filter or submit an event for review.
          </p>
        </div>
      ) : (
        <div className="grid min-w-0 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              mine={mine}
              edit={() => setCompose(event)}
              remove={() => setDeleteTarget(event)}
              notice={setNotice}
            />
          ))}
        </div>
      )}

      {/* =====================================================
          FORM
          ===================================================== */}

      {compose && (
        <EventForm
          event={compose === "new" ? undefined : compose}
          close={() => setCompose(null)}
          done={() => {
            setCompose(null);

            setNotice("Event submitted for administrator review.");

            void qc.invalidateQueries({
              queryKey: ["events"],
            });
          }}
        />
      )}

      {/* =====================================================
          DELETE CONFIRMATION
          ===================================================== */}

      {deleteTarget && (
        <ConfirmDelete
          title="Delete event?"
          description={`This will permanently remove “${deleteTarget.title}”.`}
          busy={del.isPending}
          close={() => setDeleteTarget(null)}
          confirm={() => del.mutate(deleteTarget._id)}
        />
      )}
    </div>
  );
}

/* =========================================================
   EVENT CARD
   ========================================================= */

function EventCard({
  event,
  mine,
  edit,
  remove,
  notice,
}: {
  event: CampusEvent;
  mine: boolean;
  edit: () => void;
  remove: () => void;
  notice: (s: string) => void;
}) {
  const [report, setReport] = useState(false);

  const date = new Date(event.startDate);

  const image = event.imageUrls?.[0];

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {/* IMAGE */}

      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-gradient-to-br from-blue-100 to-slate-100">
        {image ? (
          <img
            src={image}
            alt={event.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-blue-700">
            <CalendarDays className="h-10 w-10" />
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex min-w-0 items-start justify-between gap-2 p-3 sm:p-4">
          <span className="max-w-[70%] truncate rounded-full bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-blue-800 shadow-sm">
            {labels[event.category]}
          </span>

          {mine && (
            <span className="max-w-[40%] truncate rounded-full bg-slate-950/85 px-3 py-1 text-[10px] font-black uppercase text-white">
              {event.status}
            </span>
          )}
        </div>
      </div>

      {/* CONTENT */}

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-blue-50 text-center text-blue-800">
            <span className="text-[10px] font-black uppercase">
              {date.toLocaleDateString(undefined, {
                month: "short",
              })}
            </span>

            <span className="text-xl font-black leading-none">
              {date.getDate()}
            </span>
          </div>

          <div className="min-w-0 flex-1 overflow-hidden">
            <h2 className="line-clamp-2 break-words text-base font-black leading-6 text-slate-950 sm:text-lg">
              {event.title}
            </h2>

            {event.organizer && (
              <p className="mt-1 truncate text-xs font-semibold text-slate-400">
                By {event.organizer}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 grid min-w-0 gap-2 text-xs font-semibold text-slate-500">
          <p className="flex min-w-0 items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />

            <span className="min-w-0 truncate">
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </p>

          <p className="flex min-w-0 items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />

            <span className="min-w-0 truncate">{event.venue}</span>
          </p>
        </div>

        <p className="mt-4 line-clamp-3 min-w-0 break-words text-sm leading-6 text-slate-600">
          {event.description}
        </p>

        {event.status === "rejected" && event.rejectionReason && (
          <div className="mt-4 min-w-0 overflow-hidden rounded-xl bg-red-50 p-3">
            <p className="break-words text-xs font-bold leading-5 text-red-700">
              <span className="font-black">Reason:</span>{" "}
              {event.rejectionReason}
            </p>
          </div>
        )}

        <div className="mt-auto pt-5">
          <div className="flex min-w-0 flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <Link
              to={`/app/map?q=${encodeURIComponent(event.venue)}`}
              className="inline-flex min-w-0 items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-2 text-xs font-black text-blue-700"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              Map
            </Link>

            {event.registrationUrl && (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-w-0 items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-2 text-xs font-black text-slate-700"
              >
                Details
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            )}

            <div className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto">
              {mine ? (
                <>
                  <button
                    type="button"
                    onClick={edit}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-black sm:flex-none"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={remove}
                    className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-700 sm:flex-none"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setReport((value) => !value)}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-black text-slate-500"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Report
                </button>
              )}
            </div>
          </div>

          {report && (
            <InlineReport
              submit={(reason, details) =>
                eventApi.report(event._id, {
                  reason,
                  details,
                })
              }
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
   EVENT FORM
   ========================================================= */

function EventForm({
  event,
  close,
  done,
}: {
  event?: CampusEvent;
  close: () => void;
  done: () => void;
}) {
  useModalLock(true);

  const [v, setV] = useState<EventInput>(
    event
      ? {
          title: event.title,
          description: event.description,
          category: event.category,
          startDate: localDateTime(event.startDate),
          endDate: localDateTime(event.endDate),
          venue: event.venue,
          organizer: event.organizer ?? "",
          registrationUrl: event.registrationUrl ?? "",
          imageUrls: event.imageUrls ?? [],
        }
      : blank,
  );

  const [localError, setLocalError] = useState("");

  const m = useMutation({
    mutationFn: () =>
      event ? eventApi.update(event._id, v) : eventApi.create(v),

    onSuccess: done,
  });

  const upload = useMutation({
    mutationFn: mediaApi.uploadImage,

    onSuccess: (result) =>
      setV((current) => ({
        ...current,

        imageUrls: [...(current.imageUrls ?? []), result.url].slice(0, 4),
      })),
  });

  useEffect(() => {
    const onKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape" && !m.isPending && !upload.isPending) {
        close();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, m.isPending, upload.isPending]);

  const submit = () => {
    setLocalError("");

    if (v.title.trim().length < 4) {
      setLocalError("Event title must be at least 4 characters.");
      return;
    }

    if (v.description.trim().length < 10) {
      setLocalError("Event description must be at least 10 characters.");
      return;
    }

    if (!v.startDate) {
      setLocalError("Choose the event start date and time.");
      return;
    }

    if (v.venue.trim().length < 2) {
      setLocalError("Enter a valid event venue.");
      return;
    }

    if (v.endDate && new Date(v.endDate) < new Date(v.startDate)) {
      setLocalError("End date must be after the start date.");
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
      aria-labelledby="event-form-title"
      onMouseDown={(mouseEvent) => {
        if (
          mouseEvent.target === mouseEvent.currentTarget &&
          !m.isPending &&
          !upload.isPending
        ) {
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
        onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
      >
        {/* HEADER */}

        <header className="relative shrink-0 border-b border-slate-100 bg-white px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0 pr-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-blue-700">
              <CalendarDays className="h-3.5 w-3.5" />
              Campus event
            </div>

            <h2
              id="event-form-title"
              className="mt-2 break-words text-xl font-black tracking-tight text-slate-950 sm:text-2xl"
            >
              {event ? "Edit event" : "Submit an event"}
            </h2>

            <p className="mt-1.5 max-w-xl break-words text-xs leading-5 text-slate-500 sm:text-sm">
              Events become visible to students only after administrator
              moderation.
            </p>
          </div>

          <button
            type="button"
            onClick={close}
            disabled={m.isPending || upload.isPending}
            aria-label="Close event form"
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
              />

              <label className="block min-w-0 text-xs font-black text-slate-600">
                Category
                <select
                  value={v.category}
                  onChange={(e) =>
                    setV({
                      ...v,

                      category: e.target.value as EventCategory,
                    })
                  }
                  className="mt-1.5 block w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >
                  {Object.entries(labels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <Field
                label="Start date & time"
                type="datetime-local"
                value={v.startDate}
                set={(value) =>
                  setV({
                    ...v,
                    startDate: value,
                  })
                }
              />

              <Field
                label="End date & time (optional)"
                type="datetime-local"
                value={v.endDate ?? ""}
                set={(value) =>
                  setV({
                    ...v,
                    endDate: value,
                  })
                }
              />

              <Field
                label="Venue"
                value={v.venue}
                set={(value) =>
                  setV({
                    ...v,
                    venue: value,
                  })
                }
              />

              <Field
                label="Organizer (optional)"
                value={v.organizer ?? ""}
                set={(value) =>
                  setV({
                    ...v,
                    organizer: value,
                  })
                }
              />

              <div className="sm:col-span-2">
                <Field
                  label="Registration URL (optional)"
                  value={v.registrationUrl ?? ""}
                  set={(value) =>
                    setV({
                      ...v,
                      registrationUrl: value,
                    })
                  }
                />
              </div>

              <label className="block min-w-0 text-xs font-black text-slate-600 sm:col-span-2">
                Description
                <textarea
                  rows={6}
                  value={v.description}
                  onChange={(e) =>
                    setV({
                      ...v,

                      description: e.target.value,
                    })
                  }
                  className="mt-1.5 block w-full min-w-0 resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  placeholder="Tell students what the event is about..."
                />
              </label>
            </div>

            {/* IMAGE */}

            <div className="mt-5 min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-700">
                    Event image{" "}
                    <span className="font-medium text-slate-400">
                      (optional)
                    </span>
                  </p>

                  <p className="mt-1 break-words text-[11px] text-slate-500">
                    JPG, PNG, WEBP or GIF. Up to 4 images.
                  </p>
                </div>

                <label className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-xs font-black text-blue-800 transition hover:bg-blue-50">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    disabled={
                      upload.isPending || (v.imageUrls?.length ?? 0) >= 4
                    }
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (file) {
                        upload.mutate(file);
                      }

                      e.currentTarget.value = "";
                    }}
                  />

                  {upload.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}

                  {upload.isPending ? "Uploading…" : "Add image"}
                </label>
              </div>

              {!!v.imageUrls?.length && (
                <div className="mt-3 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
                  {v.imageUrls.map((url) => (
                    <div
                      key={url}
                      className="relative aspect-[4/3] min-w-0 overflow-hidden rounded-xl bg-white"
                    >
                      <img
                        src={url}
                        alt="Event upload"
                        className="absolute inset-0 h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        aria-label="Remove uploaded image"
                        onClick={() =>
                          setV({
                            ...v,

                            imageUrls: (v.imageUrls ?? []).filter(
                              (imageUrl) => imageUrl !== url,
                            ),
                          })
                        }
                        className="absolute right-1 top-1 rounded-full bg-white/95 p-1 shadow"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {upload.error && (
                <p className="mt-3 break-words rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">
                  {readError(upload.error)}
                </p>
              )}
            </div>

            {localError && (
              <p className="mt-4 break-words rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">
                {localError}
              </p>
            )}

            {m.error && (
              <p className="mt-4 break-words rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">
                {readError(m.error)}
              </p>
            )}

            <div className="h-3" />
          </div>
        </div>

        {/* FOOTER */}

        <footer className="shrink-0 border-t border-slate-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="hidden max-w-sm text-[11px] leading-5 text-slate-400 sm:block">
              Student events remain pending until an administrator reviews and
              approves them.
            </p>

            <div className="flex min-w-0 flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={close}
                disabled={m.isPending || upload.isPending}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={m.isPending || upload.isPending}
                onClick={submit}
                className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {m.isPending
                  ? "Submitting…"
                  : event
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
}: {
  label: string;
  value: string;
  set: (x: string) => void;
  type?: string;
}) {
  return (
    <label className="block min-w-0 text-xs font-black text-slate-600">
      {label}

      <input
        type={type}
        value={value}
        onChange={(e) => set(e.target.value)}
        className="mt-1.5 block w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </label>
  );
}

/* =========================================================
   INLINE REPORT
   ========================================================= */

function InlineReport({
  submit,
  done,
}: {
  submit: (reason: string, details: string) => Promise<any>;

  done: () => void;
}) {
  const [reason, setReason] = useState("Information is inaccurate");

  const [details, setDetails] = useState("");

  const m = useMutation({
    mutationFn: () => submit(reason, details),

    onSuccess: done,
  });

  return (
    <div className="mt-4 min-w-0 overflow-hidden rounded-2xl bg-red-50 p-4">
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full min-w-0 rounded-xl border border-red-200 bg-white p-2.5 text-sm"
      >
        <option>Information is inaccurate</option>

        <option>Event was cancelled</option>

        <option>Spam or advertising</option>

        <option>Potential scam</option>
      </select>

      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        rows={2}
        placeholder="Optional details"
        className="mt-2 w-full min-w-0 resize-y rounded-xl border border-red-200 bg-white p-2.5 text-sm"
      />

      {m.error && (
        <p className="mt-2 break-words text-xs font-bold text-red-700">
          {readError(m.error)}
        </p>
      )}

      <button
        type="button"
        onClick={() => m.mutate()}
        disabled={m.isPending}
        className="mt-2 rounded-lg bg-red-700 px-3 py-2 text-xs font-black text-white disabled:opacity-50"
      >
        {m.isPending ? "Sending…" : "Send report"}
      </button>
    </div>
  );
}

/* =========================================================
   DELETE CONFIRMATION PORTAL
   ========================================================= */

function ConfirmDelete({
  title,
  description,
  busy,
  close,
  confirm,
}: {
  title: string;
  description: string;
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
        sm:px-5 sm:py-5
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-event-title"
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
              <AlertTriangle className="h-5 w-5" />
            </span>

            <div className="min-w-0 flex-1">
              <h2
                id="delete-event-title"
                className="break-words text-lg font-black text-slate-950"
              >
                {title}
              </h2>

              <p className="mt-1 break-words text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>

            <button
              type="button"
              onClick={close}
              disabled={busy}
              aria-label="Close delete confirmation"
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
            {busy ? "Deleting…" : "Delete event"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
