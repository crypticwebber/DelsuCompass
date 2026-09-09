import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { timetableApi } from "./timetable.api";
import { weekDays, type TimetableEntry } from "./timetable.types";
import type { TimetableFormValues } from "./timetable.schema";
import { TimetableEntryForm } from "./components/TimetableEntryForm";
import { TimetableImportPanel } from "./components/TimetableImportPanel";

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

export function TimetablePage() {
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);

  const [editing, setEditing] = useState<TimetableEntry | null>(null);

  const [message, setMessage] = useState<string | null>(null);

  const [importOpen, setImportOpen] = useState(false);

  const timetable = useQuery({
    queryKey: ["timetable"],
    queryFn: timetableApi.list,
  });

  const save = useMutation({
    mutationFn: async (values: TimetableFormValues) =>
      editing
        ? timetableApi.update(editing._id, values)
        : timetableApi.create(values),

    onSuccess: async (saved) => {
      queryClient.setQueryData<TimetableEntry[]>(["timetable"], (old = []) =>
        editing
          ? old.map((entry) => (entry._id === saved._id ? saved : entry))
          : [...old, saved],
      );

      await queryClient.invalidateQueries({
        queryKey: ["timetable"],
      });

      setFormOpen(false);
      setEditing(null);

      setMessage("Timetable saved successfully.");
    },
  });

  const remove = useMutation({
    mutationFn: timetableApi.remove,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["timetable"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["reminders"],
        }),
      ]);

      setMessage("Class removed from your timetable.");
    },
  });

  const grouped = useMemo(
    () =>
      Object.fromEntries(
        weekDays.map((day) => [
          day,
          (timetable.data ?? []).filter((entry) => entry.day === day),
        ]),
      ) as Record<(typeof weekDays)[number], TimetableEntry[]>,
    [timetable.data],
  );

  const count = timetable.data?.length ?? 0;

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <section className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Academic organizer
          </p>

          <h1 className="mt-1 break-words text-3xl font-black tracking-tight">
            My timetable
          </h1>

          <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-slate-500">
            Build your weekly class schedule. DELSU Compass uses it to surface
            today&apos;s classes and power class reminders.
          </p>
        </div>

        {/* BUTTONS: ALWAYS ALIGNED */}

        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="
              inline-flex h-11 min-w-0
              items-center justify-center gap-2
              whitespace-nowrap
              rounded-xl
              border border-slate-300
              bg-white
              px-3
              text-xs font-bold text-slate-800
              transition
              hover:bg-slate-50
              sm:min-w-[165px]
              sm:px-4
              sm:text-sm
            "
          >
            <Upload className="h-4 w-4 shrink-0" />
            <span>Import timetable</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="
              inline-flex h-11 min-w-0
              items-center justify-center gap-2
              whitespace-nowrap
              rounded-xl
              bg-slate-950
              px-3
              text-xs font-bold text-white
              transition
              hover:bg-slate-800
              sm:min-w-[135px]
              sm:px-4
              sm:text-sm
            "
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Add class</span>
          </button>
        </div>
      </section>

      {/* =====================================================
          MESSAGE
          ===================================================== */}

      {message && (
        <div className="flex min-w-0 items-start justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
          <span className="min-w-0 flex-1 break-words">{message}</span>

          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setMessage(null)}
            className="shrink-0 rounded-lg p-1 hover:bg-blue-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {save.error && (
        <div className="break-words rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {readApiError(save.error)}
        </div>
      )}

      {/* =====================================================
          STATS
          ===================================================== */}

      <div className="grid min-w-0 gap-4 sm:grid-cols-3">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Classes this week</p>

          <strong className="mt-2 block text-3xl">{count}</strong>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Scheduled days</p>

          <strong className="mt-2 block text-3xl">
            {weekDays.filter((day) => grouped[day]?.length).length}
          </strong>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Reminder-ready</p>

          <strong className="mt-2 block text-3xl">{count}</strong>
        </div>
      </div>

      {/* =====================================================
          TIMETABLE CONTENT
          ===================================================== */}

      {timetable.isLoading ? (
        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="h-40 min-w-0 animate-pulse rounded-3xl bg-slate-200"
            />
          ))}
        </div>
      ) : timetable.isError ? (
        <div className="rounded-3xl border border-red-200 bg-white p-8 text-center">
          <p className="font-bold">We couldn&apos;t load your timetable.</p>

          <button
            type="button"
            onClick={() => timetable.refetch()}
            className="mt-3 text-sm font-bold underline"
          >
            Try again
          </button>
        </div>
      ) : count === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <CalendarDays className="mx-auto h-9 w-9 text-slate-400" />

          <h2 className="mt-3 text-lg font-black">Your timetable is empty</h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Add your first class to start organizing your week and setting
            reminders.
          </p>

          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"
          >
            Add first class
          </button>
        </div>
      ) : (
        <div className="grid min-w-0 gap-4 xl:grid-cols-2">
          {weekDays
            .filter((day) => grouped[day]?.length)
            .map((day) => (
              <section
                key={day}
                className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex min-w-0 items-center justify-between gap-3">
                  <h2 className="min-w-0 break-words text-lg font-black capitalize">
                    {day}
                  </h2>

                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                    {grouped[day].length}{" "}
                    {grouped[day].length === 1 ? "class" : "classes"}
                  </span>
                </div>

                <div className="space-y-3">
                  {grouped[day].map((entry) => (
                    <article
                      key={entry._id}
                      className="min-w-0 rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-sm font-black text-blue-800">
                          {entry.courseCode.slice(0, 2)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 flex-wrap items-center gap-2">
                                <p className="min-w-0 break-words font-black">
                                  {entry.courseCode}
                                </p>

                                {entry.isCarryOver && (
                                  <span className="max-w-full break-words rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-800">
                                    Carry-over
                                    {entry.sourceLevel
                                      ? ` · ${entry.sourceLevel}L`
                                      : ""}
                                  </span>
                                )}
                              </div>

                              <p className="mt-0.5 min-w-0 break-words text-sm text-slate-600">
                                {entry.courseTitle}
                              </p>
                            </div>

                            <div className="flex shrink-0 gap-1">
                              <button
                                type="button"
                                aria-label={`Edit ${entry.courseCode}`}
                                onClick={() => {
                                  setEditing(entry);

                                  setFormOpen(true);
                                }}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                aria-label={`Delete ${entry.courseCode}`}
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Delete ${entry.courseCode} from your timetable?`,
                                    )
                                  ) {
                                    remove.mutate(entry._id);
                                  }
                                }}
                                className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 flex min-w-0 flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
                            <span className="inline-flex min-w-0 items-center gap-1">
                              <Clock3 className="h-3.5 w-3.5 shrink-0" />

                              <span className="break-words">
                                {entry.startTime}–{entry.endTime}
                              </span>
                            </span>

                            <span className="inline-flex min-w-0 items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />

                              <span className="break-words">{entry.venue}</span>
                            </span>

                            {entry.lecturer && (
                              <span className="break-words">
                                {entry.lecturer}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}

      {/* =====================================================
          IMPORT MODAL
          ===================================================== */}

      {importOpen && (
        <TimetableImportPanel
          existingCount={count}
          onClose={() => setImportOpen(false)}
          onImported={(createdCount, reminderCount) => {
            setImportOpen(false);

            setMessage(
              `${createdCount} ${
                createdCount === 1 ? "class" : "classes"
              } imported successfully${
                reminderCount
                  ? ` with ${reminderCount} ${
                      reminderCount === 1 ? "reminder" : "reminders"
                    }`
                  : ""
              }.`,
            );
          }}
        />
      )}

      {/* =====================================================
          ADD / EDIT CLASS
          ===================================================== */}

      {formOpen && (
        <TimetableFormModal
          editing={editing}
          busy={save.isPending}
          error={save.error ? readApiError(save.error) : null}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSubmit={async (values) => {
            await save.mutateAsync(values);
          }}
        />
      )}
    </div>
  );
}

/* =========================================================
   ADD / EDIT CLASS MODAL
   ========================================================= */

function TimetableFormModal({
  editing,
  busy,
  error,
  onClose,
  onSubmit,
}: {
  editing: TimetableEntry | null;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: TimetableFormValues) => Promise<void>;
}) {
  useModalLock(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [busy, onClose]);

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
      aria-labelledby="timetable-form-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose();
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
          shadow-[0_25px_80px_rgba(15,23,42,0.4)]
          sm:h-auto
          sm:max-h-[calc(100dvh-2.5rem)]
          sm:rounded-3xl
        "
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="relative shrink-0 border-b border-slate-100 bg-white px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0 pr-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-blue-700">
              <CalendarDays className="h-3.5 w-3.5" />
              Timetable
            </div>

            <h2
              id="timetable-form-title"
              className="mt-2 break-words text-xl font-black tracking-tight text-slate-950 sm:text-2xl"
            >
              {editing ? "Edit class" : "Add a class"}
            </h2>

            <p className="mt-1.5 max-w-xl break-words text-xs leading-5 text-slate-500 sm:text-sm">
              {editing
                ? "Update the class details below and save your changes."
                : "Add the class details to your weekly timetable."}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close timetable form"
            onClick={onClose}
            disabled={busy}
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

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div className="w-full min-w-0 p-5 sm:p-6">
            {error && (
              <div className="mb-4 break-words rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-semibold leading-6 text-red-700">
                {error}
              </div>
            )}

            <TimetableEntryForm
              key={editing?._id ?? "new"}
              initial={editing}
              busy={busy}
              onSubmit={onSubmit}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
