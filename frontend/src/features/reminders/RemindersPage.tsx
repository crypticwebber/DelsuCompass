import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BellRing,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { reminderApi } from "./reminder.api";
import { timetableApi } from "@/features/timetable/timetable.api";

function formatOffset(minutes: number) {
  if (minutes % 1440 === 0) {
    const days = minutes / 1440;

    return `${days} ${days === 1 ? "day" : "days"}`;
  }

  if (minutes % 60 === 0) {
    const hours = minutes / 60;

    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  return `${minutes} minutes`;
}

function readApiError(error: unknown) {
  const candidate = error as {
    response?: {
      data?: {
        error?: {
          message?: string;
        };
      };
    };
  };

  return (
    candidate.response?.data?.error?.message ??
    "Something went wrong. Please try again."
  );
}

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

const fieldClass =
  "block h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

export function RemindersPage() {
  const queryClient = useQueryClient();

  const reminders = useQuery({
    queryKey: ["reminders"],
    queryFn: reminderApi.list,
  });

  const timetable = useQuery({
    queryKey: ["timetable"],
    queryFn: timetableApi.list,
  });

  const [classId, setClassId] = useState("");
  const [amount, setAmount] = useState(30);

  const [unit, setUnit] = useState<"minutes" | "hours">("minutes");

  const [error, setError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    courseCode: string;
    courseTitle?: string;
  } | null>(null);

  const create = useMutation({
    mutationFn: reminderApi.create,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["reminders"],
      });

      setClassId("");
      setError(null);
    },

    onError: (error: unknown) => {
      setError(readApiError(error));
    },
  });

  const update = useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;

      patch: {
        enabled?: boolean;
        minutesBefore?: number;
      };
    }) => reminderApi.update(id, patch),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["reminders"],
      });
    },
  });

  const remove = useMutation({
    mutationFn: reminderApi.remove,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["reminders"],
      });

      setDeleteTarget(null);
    },

    onError: (error: unknown) => {
      setError(readApiError(error));
    },
  });

  const reminderClassIds = new Set(
    (reminders.data ?? [])
      .map((reminder) => reminder.timetableEntryId?._id)
      .filter(Boolean),
  );

  const available = (timetable.data ?? []).filter(
    (entry) => !reminderClassIds.has(entry._id),
  );

  const calculatedMinutes = Math.min(
    10080,
    amount * (unit === "hours" ? 60 : 1),
  );

  const reminderCount = reminders.data?.length ?? 0;

  const activeCount =
    reminders.data?.filter((reminder) => reminder.enabled).length ?? 0;

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <section className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
          Stay on schedule
        </p>

        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
          Class reminders
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Set reminders for your timetable so DELSU Compass can help you prepare
          before each class.
        </p>
      </section>

      {/* =====================================================
          SUMMARY CARDS
          ===================================================== */}

      <section className="grid min-w-0 gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={<BellRing className="h-5 w-5" />}
          label="Reminders"
          value={String(reminderCount)}
          description="Created reminders"
        />

        <SummaryCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Active"
          value={String(activeCount)}
          description="Currently enabled"
        />

        <SummaryCard
          icon={<CalendarDays className="h-5 w-5" />}
          label="Available classes"
          value={String(available.length)}
          description="Without reminders"
        />
      </section>

      {/* =====================================================
          CREATE REMINDER
          ===================================================== */}

      <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
              <Plus className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-black text-slate-950">
                Create reminder
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Choose a class and decide how early you want to be reminded.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {error && (
            <div className="mb-5 flex min-w-0 items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <span className="min-w-0 flex-1 break-words">{error}</span>

              <button
                type="button"
                aria-label="Dismiss error"
                onClick={() => setError(null)}
                className="shrink-0 rounded-lg p-1 transition hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {(timetable.data?.length ?? 0) === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-bold text-amber-900">
                You don&apos;t have any timetable classes yet.
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                Add or import at least one class from your timetable before
                creating a reminder.
              </p>
            </div>
          ) : available.length === 0 ? (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />

                <div>
                  <p className="text-sm font-black text-blue-950">
                    Every class already has a reminder
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    You can adjust reminder times or disable individual
                    reminders below.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(260px,0.8fr)_auto] lg:items-end">
              {/* CLASS */}

              <div className="min-w-0">
                <label
                  htmlFor="reminder-class"
                  className="mb-2 block text-xs font-black uppercase tracking-[0.1em] text-slate-500"
                >
                  Class
                </label>

                <select
                  id="reminder-class"
                  value={classId}
                  onChange={(event) => setClassId(event.target.value)}
                  className={fieldClass}
                >
                  <option value="">Select a class</option>

                  {available.map((entry) => (
                    <option key={entry._id} value={entry._id}>
                      {entry.courseCode} · {entry.day} · {entry.startTime}
                      {entry.isCarryOver ? " · carry-over" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* REMIND ME */}

              <div className="min-w-0">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.1em] text-slate-500">
                  Remind me
                </label>

                <div className="grid min-w-0 grid-cols-[90px_minmax(0,1fr)]">
                  <input
                    aria-label="Reminder amount"
                    type="number"
                    min={1}
                    max={10080}
                    value={amount}
                    onChange={(event) =>
                      setAmount(Math.max(1, Number(event.target.value)))
                    }
                    className="
                      block h-11 w-full min-w-0
                      rounded-l-xl
                      border border-r-0 border-slate-200
                      bg-white px-3
                      text-sm font-bold text-slate-800
                      outline-none
                      focus:z-10
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-50
                    "
                  />

                  <select
                    aria-label="Reminder unit"
                    value={unit}
                    onChange={(event) =>
                      setUnit(event.target.value as "minutes" | "hours")
                    }
                    className="
                      block h-11 w-full min-w-0
                      rounded-r-xl
                      border border-slate-200
                      bg-slate-50 px-3
                      text-sm font-semibold text-slate-700
                      outline-none
                      focus:z-10
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-50
                    "
                  >
                    <option value="minutes">minutes before</option>

                    <option value="hours">hours before</option>
                  </select>
                </div>
              </div>

              {/* BUTTON */}

              <button
                type="button"
                disabled={
                  !classId || create.isPending || calculatedMinutes > 10080
                }
                onClick={() =>
                  create.mutate({
                    timetableEntryId: classId,

                    minutesBefore: calculatedMinutes,

                    enabled: true,
                  })
                }
                className="
                  inline-flex h-11 w-full
                  items-center justify-center gap-2
                  whitespace-nowrap
                  rounded-xl
                  bg-slate-950
                  px-5
                  text-sm font-black text-white
                  transition
                  hover:bg-slate-800
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  lg:w-auto
                "
              >
                <Plus className="h-4 w-4 shrink-0" />

                {create.isPending ? "Adding..." : "Add reminder"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          REMINDERS
          ===================================================== */}

      <section className="min-w-0">
        {reminderCount > 0 && (
          <div className="mb-4 flex min-w-0 items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-black text-slate-950">
                Your reminders
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage when each class reminder is sent.
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
              {reminderCount} {reminderCount === 1 ? "reminder" : "reminders"}
            </span>
          </div>
        )}

        {reminders.isLoading ? (
          <div className="grid gap-3">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-3xl bg-slate-200"
              />
            ))}
          </div>
        ) : reminders.isError ? (
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center">
            <p className="font-black text-slate-900">
              We couldn&apos;t load your reminders.
            </p>

            <button
              type="button"
              onClick={() => reminders.refetch()}
              className="mt-3 text-sm font-bold text-blue-700 underline"
            >
              Try again
            </button>
          </div>
        ) : reminderCount === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <BellRing className="h-7 w-7" />
            </div>

            <h2 className="mt-4 text-lg font-black text-slate-950">
              No class reminders yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your reminder settings will appear here after you connect one to a
              class.
            </p>
          </div>
        ) : (
          <div className="grid min-w-0 gap-3">
            {reminders.data?.map((reminder) => {
              const classEntry = reminder.timetableEntryId;

              return (
                <article
                  key={reminder._id}
                  className="
                      min-w-0
                      overflow-hidden
                      rounded-3xl
                      border border-slate-200
                      bg-white
                      shadow-sm
                      transition
                      hover:border-slate-300
                      hover:shadow-md
                    "
                >
                  <div className="flex min-w-0 flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center">
                    {/* CLASS INFO */}

                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                          reminder.enabled
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <BellRing className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <h3 className="break-words font-black text-slate-950">
                            {classEntry?.courseCode ?? "Class reminder"}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                              reminder.enabled
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {reminder.enabled ? "Active" : "Paused"}
                          </span>

                          {classEntry?.isCarryOver && (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
                              Carry-over
                            </span>
                          )}
                        </div>

                        {classEntry?.courseTitle && (
                          <p className="mt-1 break-words text-sm font-medium text-slate-600">
                            {classEntry.courseTitle}
                          </p>
                        )}

                        <div className="mt-2 flex min-w-0 flex-wrap gap-x-4 gap-y-1.5 text-xs font-semibold text-slate-500">
                          <span className="inline-flex items-center gap-1.5 capitalize">
                            <CalendarDays className="h-3.5 w-3.5 shrink-0" />

                            {classEntry?.day ?? "Class day"}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="h-3.5 w-3.5 shrink-0" />

                            {classEntry?.startTime ?? "Time unavailable"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CONTROLS */}

                    <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-3 lg:w-[390px] lg:shrink-0">
                      <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
                        {/* TIME */}

                        <div className="min-w-0">
                          <label
                            htmlFor={`reminder-time-${reminder._id}`}
                            className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.1em] text-slate-400"
                          >
                            Remind me
                          </label>

                          <select
                            id={`reminder-time-${reminder._id}`}
                            aria-label={`Reminder time for ${
                              classEntry?.courseCode ?? "class"
                            }`}
                            value={reminder.minutesBefore}
                            disabled={update.isPending}
                            onChange={(event) =>
                              update.mutate({
                                id: reminder._id,

                                patch: {
                                  minutesBefore: Number(event.target.value),
                                },
                              })
                            }
                            className="block h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:opacity-60"
                          >
                            <option value={5}>5 minutes</option>

                            <option value={10}>10 minutes</option>

                            <option value={15}>15 minutes</option>

                            <option value={30}>30 minutes</option>

                            <option value={45}>45 minutes</option>

                            <option value={60}>1 hour</option>

                            <option value={120}>2 hours</option>

                            <option value={180}>3 hours</option>

                            <option value={360}>6 hours</option>

                            <option value={1440}>1 day</option>

                            {![
                              5, 10, 15, 30, 45, 60, 120, 180, 360, 1440,
                            ].includes(reminder.minutesBefore) && (
                              <option value={reminder.minutesBefore}>
                                {formatOffset(reminder.minutesBefore)}
                              </option>
                            )}
                          </select>
                        </div>

                        {/* ACTIVE */}

                        <div>
                          <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                            Status
                          </p>

                          <label
                            className={`
                                flex h-10 cursor-pointer
                                items-center gap-2
                                whitespace-nowrap
                                rounded-xl
                                border px-3
                                text-xs font-black
                                transition
                                ${
                                  reminder.enabled
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-slate-200 bg-white text-slate-500"
                                }
                              `}
                          >
                            <input
                              type="checkbox"
                              checked={reminder.enabled}
                              disabled={update.isPending}
                              onChange={(event) =>
                                update.mutate({
                                  id: reminder._id,

                                  patch: {
                                    enabled: event.target.checked,
                                  },
                                })
                              }
                              className="h-4 w-4 shrink-0"
                            />

                            {reminder.enabled ? "Active" : "Paused"}
                          </label>
                        </div>

                        {/* DELETE */}

                        <div>
                          <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                            Remove
                          </p>

                          <button
                            type="button"
                            aria-label="Delete reminder"
                            disabled={remove.isPending}
                            onClick={() =>
                              setDeleteTarget({
                                id: reminder._id,

                                courseCode:
                                  classEntry?.courseCode ?? "this class",

                                courseTitle: classEntry?.courseTitle,
                              })
                            }
                            className="
                                grid h-10 w-10
                                place-items-center
                                rounded-xl
                                border border-red-100
                                bg-white
                                text-red-600
                                transition
                                hover:border-red-200
                                hover:bg-red-50
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                              "
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 border-t border-slate-200 pt-2.5">
                        <p className="text-[11px] font-semibold text-slate-500">
                          Reminder set for{" "}
                          <strong className="text-slate-700">
                            {formatOffset(reminder.minutesBefore)}
                          </strong>{" "}
                          before this class.
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* =====================================================
          DELETE CONFIRMATION DIALOG
          ===================================================== */}

      {deleteTarget && (
        <DeleteReminderDialog
          courseCode={deleteTarget.courseCode}
          courseTitle={deleteTarget.courseTitle}
          busy={remove.isPending}
          error={remove.error ? readApiError(remove.error) : null}
          onCancel={() => {
            if (!remove.isPending) {
              setDeleteTarget(null);
            }
          }}
          onConfirm={() => remove.mutate(deleteTarget.id)}
        />
      )}
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
   ========================================================= */

function SummaryCard({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <article className="flex min-w-0 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
        {icon}
      </div>

      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <strong className="text-xl font-black text-slate-950">{value}</strong>

          <span className="text-xs font-black text-slate-700">{label}</span>
        </div>

        <p className="mt-0.5 truncate text-xs text-slate-500">{description}</p>
      </div>
    </article>
  );
}

/* =========================================================
   DELETE REMINDER DIALOG
   ========================================================= */

function DeleteReminderDialog({
  courseCode,
  courseTitle,
  busy,
  error,
  onCancel,
  onConfirm,
}: {
  courseCode: string;
  courseTitle?: string;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useModalLock(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [busy, onCancel]);

  const modal = (
    <div
      className="
        fixed left-0 top-0
        z-[10000]
        flex h-[100dvh] w-screen
        items-center justify-center
        overflow-hidden
        bg-slate-950/75
        px-4 py-5
        backdrop-blur-sm
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-reminder-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onCancel();
        }
      }}
    >
      <div
        className="
          relative
          w-full
          max-w-md
          overflow-hidden
          rounded-3xl
          border border-slate-200
          bg-white
          shadow-[0_25px_80px_rgba(15,23,42,0.42)]
        "
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* CLOSE */}

        <button
          type="button"
          aria-label="Close delete confirmation"
          onClick={onCancel}
          disabled={busy}
          className="
            absolute right-4 top-4
            grid h-9 w-9
            place-items-center
            rounded-full
            border border-slate-200
            bg-white
            text-slate-500
            transition
            hover:bg-slate-100
            hover:text-slate-950
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <X className="h-4 w-4" />
        </button>

        {/* BODY */}

        <div className="p-5 pr-14 sm:p-6 sm:pr-16">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
            <Trash2 className="h-5 w-5" />
          </div>

          <h2
            id="delete-reminder-title"
            className="mt-4 text-xl font-black tracking-tight text-slate-950"
          >
            Delete reminder?
          </h2>

          <p className="mt-2 break-words text-sm leading-6 text-slate-500">
            You&apos;re about to remove the reminder for{" "}
            <strong className="font-black text-slate-800">{courseCode}</strong>.
          </p>

          {courseTitle && (
            <p className="mt-1 break-words text-xs font-semibold text-slate-400">
              {courseTitle}
            </p>
          )}

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold leading-5 text-slate-600">
              The class will remain on your timetable. Only its reminder setting
              will be deleted.
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-bold leading-5 text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* ACTIONS */}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="
              inline-flex h-11
              items-center justify-center
              rounded-xl
              border border-slate-200
              bg-white
              px-5
              text-sm font-black text-slate-700
              transition
              hover:bg-slate-100
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Keep reminder
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="
              inline-flex h-11
              items-center justify-center gap-2
              rounded-xl
              bg-red-600
              px-5
              text-sm font-black text-white
              transition
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {busy ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete reminder
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
