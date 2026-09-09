import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  RefreshCcw,
  Upload,
  X,
} from "lucide-react";

import { timetableApi } from "../timetable.api";
import type { ImportEntry, TimetableAnalysis } from "../timetable.types";

function apiMessage(error: unknown) {
  const e = error as {
    response?: {
      data?: {
        error?: {
          message?: string;
          code?: string;
          details?: {
            conflicts?: Array<{
              a: string;
              b: string;
            }>;
          };
        };
      };
    };
  };

  return {
    message:
      e.response?.data?.error?.message ?? "Could not process timetable file.",

    code: e.response?.data?.error?.code,

    conflicts: e.response?.data?.error?.details?.conflicts ?? [],
  };
}

const inputClass =
  "block w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

function useModalLock() {
  useEffect(() => {
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
  }, []);
}

export function TimetableImportPanel({
  onClose,
  existingCount,
  onImported,
}: {
  onClose(): void;
  existingCount: number;

  onImported?: (createdCount: number, reminderCount: number) => void;
}) {
  useModalLock();

  const qc = useQueryClient();

  const [analysis, setAnalysis] = useState<TimetableAnalysis | null>(null);

  const [currentEntries, setCurrentEntries] = useState<ImportEntry[]>([]);

  const [carryEntries, setCarryEntries] = useState<ImportEntry[]>([]);

  const [selectedCurrent, setSelectedCurrent] = useState<
    Record<string, boolean>
  >({});

  const [selectedCarry, setSelectedCarry] = useState<Record<string, boolean>>(
    {},
  );

  const [mode, setMode] = useState<"add" | "replace">(
    existingCount > 0 ? "add" : "replace",
  );

  const [reminderValue, setReminderValue] = useState(30);

  const [reminderUnit, setReminderUnit] = useState<"minutes" | "hours">(
    "minutes",
  );

  const [createReminders, setCreateReminders] = useState(true);

  const [allowConflicts, setAllowConflicts] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [conflictText, setConflictText] = useState<string[]>([]);

  const analyze = useMutation({
    mutationFn: timetableApi.analyzeImport,

    onSuccess(data) {
      setAnalysis(data);

      setCurrentEntries(data.currentLevelEntries);

      setCarryEntries(data.carryOverCandidates);

      setSelectedCurrent(
        Object.fromEntries(
          data.currentLevelEntries.map((entry) => [entry.tempId, true]),
        ),
      );

      setSelectedCarry({});

      setError(null);
      setConflictText([]);
    },

    onError(error) {
      setError(apiMessage(error).message);
    },
  });

  const selectedEntries = useMemo(
    () => [
      ...currentEntries.filter(
        (entry) => selectedCurrent[entry.tempId] !== false,
      ),

      ...carryEntries.filter((entry) => Boolean(selectedCarry[entry.tempId])),
    ],
    [currentEntries, carryEntries, selectedCurrent, selectedCarry],
  );

  const selectedCurrentCount = currentEntries.filter(
    (entry) => selectedCurrent[entry.tempId] !== false,
  ).length;

  const selectedCarryCount = carryEntries.filter((entry) =>
    Boolean(selectedCarry[entry.tempId]),
  ).length;

  const confirmImport = useMutation({
    mutationFn: () =>
      timetableApi.confirmImport({
        entries: selectedEntries,

        mode,

        defaultReminderMinutes: createReminders
          ? reminderValue * (reminderUnit === "hours" ? 60 : 1)
          : null,

        allowConflicts,
      }),

    async onSuccess(data) {
      await Promise.all([
        qc.invalidateQueries({
          queryKey: ["timetable"],
        }),

        qc.invalidateQueries({
          queryKey: ["reminders"],
        }),
      ]);

      if (onImported) {
        onImported(data.createdCount, data.reminderCount);
      } else {
        onClose();
      }
    },

    onError(error) {
      const parsed = apiMessage(error);

      setError(parsed.message);

      setConflictText(
        parsed.conflicts.map((conflict) => `${conflict.a} ↔ ${conflict.b}`),
      );
    },
  });

  const updateEntry = (
    collection: "current" | "carry",

    tempId: string,

    patch: Partial<ImportEntry>,
  ) => {
    const setter =
      collection === "current" ? setCurrentEntries : setCarryEntries;

    setter((entries) =>
      entries.map((entry) =>
        entry.tempId === tempId
          ? {
              ...entry,
              ...patch,
            }
          : entry,
      ),
    );
  };

  const resetFile = () => {
    setAnalysis(null);

    setCurrentEntries([]);
    setCarryEntries([]);

    setSelectedCurrent({});
    setSelectedCarry({});

    setError(null);
    setConflictText([]);

    setAllowConflicts(false);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !analyze.isPending &&
        !confirmImport.isPending
      ) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [analyze.isPending, confirmImport.isPending, onClose]);

  const busy = analyze.isPending || confirmImport.isPending;

  const modal = (
    <div
      className="
        fixed left-0 top-0
        z-[10000]
        flex h-[100dvh] w-screen
        items-start justify-center
        overflow-hidden
        bg-slate-950/75
        px-3 py-3
        backdrop-blur-sm
        sm:items-center
        sm:px-5
        sm:py-5
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="timetable-import-title"
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
          max-w-6xl
          flex-col
          overflow-hidden
          rounded-2xl
          border border-slate-200
          bg-white
          shadow-[0_25px_90px_rgba(15,23,42,0.42)]
          sm:h-auto
          sm:max-h-[calc(100dvh-2.5rem)]
          sm:rounded-3xl
        "
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* HEADER */}

        <header className="relative shrink-0 border-b border-slate-100 bg-white px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0 pr-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-blue-700">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Timetable import
            </div>

            <h2
              id="timetable-import-title"
              className="mt-2 break-words text-xl font-black tracking-tight text-slate-950 sm:text-2xl"
            >
              {analysis
                ? "Review detected classes"
                : "Import faculty timetable"}
            </h2>

            <p className="mt-1.5 max-w-3xl break-words text-xs leading-5 text-slate-500 sm:text-sm">
              Upload your faculty or department timetable. DELSU Compass
              analyzes the file first so you can review every detected class
              before anything is saved.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close import dialog"
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

        {/* BODY */}

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div className="min-w-0 p-5 sm:p-6">
            {!analysis && (
              <UploadStage
                pending={analyze.isPending}
                onFile={(file) => {
                  setError(null);
                  setConflictText([]);

                  analyze.mutate(file);
                }}
              />
            )}

            {error && (
              <div className="mt-5 min-w-0 rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                  <div className="min-w-0">
                    <p className="break-words text-sm font-black text-red-800">
                      {error}
                    </p>

                    {!analysis && (
                      <p className="mt-1 text-xs leading-5 text-red-700/80">
                        Excel files normally provide the most reliable timetable
                        structure. The importer can recognize both row-based and
                        weekday/time-grid timetables.
                      </p>
                    )}
                  </div>
                </div>

                {conflictText.length > 0 && (
                  <div className="mt-4 rounded-xl bg-white/70 p-3">
                    <p className="text-xs font-black text-red-900">
                      Schedule clashes detected
                    </p>

                    <div className="mt-2 space-y-1 text-xs font-semibold text-red-700">
                      {conflictText.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>

                    <label className="mt-3 flex items-start gap-2 text-xs font-bold text-red-900">
                      <input
                        type="checkbox"
                        checked={allowConflicts}
                        onChange={(event) =>
                          setAllowConflicts(event.target.checked)
                        }
                        className="mt-0.5 shrink-0"
                      />

                      <span>
                        I reviewed these clashes and want to keep both classes.
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {analysis && (
              <div className="space-y-6">
                {/* SUMMARY */}

                <section className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <SummaryCard
                    label="Department"
                    value={analysis.studentProfile.department ?? "Not set"}
                  />

                  <SummaryCard
                    label="Level"
                    value={
                      analysis.studentProfile.level
                        ? `${analysis.studentProfile.level} Level`
                        : "Not set"
                    }
                  />

                  <SummaryCard label="Detection" value={analysis.confidence} />

                  <SummaryCard
                    label="Classes found"
                    value={String(currentEntries.length + carryEntries.length)}
                  />
                </section>

                {/* FILE */}

                <section className="flex min-w-0 items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-blue-700 shadow-sm">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-blue-950">
                      {analysis.fileName}
                    </p>

                    <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-blue-700">
                      {analysis.sourceType} timetable
                    </p>
                  </div>
                </section>

                {/* WARNINGS */}

                {analysis.warnings.map((warning) => (
                  <div
                    key={warning}
                    className="flex min-w-0 items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

                    <span className="min-w-0 break-words">{warning}</span>
                  </div>
                ))}

                {/* CURRENT LEVEL */}

                <section>
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-slate-950">
                        Current-level classes
                      </h3>

                      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                        Review the detected classes. Untick anything that should
                        not be imported and correct fields the parser got wrong.
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                      {selectedCurrentCount} of {currentEntries.length} selected
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {currentEntries.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                        <p className="text-sm font-bold text-slate-700">
                          No current-level classes were matched.
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Check the detected timetable sections or try another
                          copy of the faculty timetable.
                        </p>
                      </div>
                    ) : (
                      currentEntries.map((entry) => {
                        const selected =
                          selectedCurrent[entry.tempId] !== false;

                        return (
                          <SelectableEntry
                            key={entry.tempId}
                            selected={selected}
                            onSelectedChange={(checked) =>
                              setSelectedCurrent((previous) => ({
                                ...previous,

                                [entry.tempId]: checked,
                              }))
                            }
                          >
                            <EditableRow
                              entry={entry}
                              disabled={!selected}
                              onChange={(patch) =>
                                updateEntry("current", entry.tempId, patch)
                              }
                            />
                          </SelectableEntry>
                        );
                      })
                    )}
                  </div>
                </section>

                {/* CARRY OVER */}

                <section>
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-slate-950">
                      Carry-over candidates
                    </h3>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                      Previous-level classes found in the same timetable. Select
                      only courses you are actually carrying over.
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    {carryEntries.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
                        No previous-level course candidates were detected. You
                        can still add a carry-over class manually later.
                      </div>
                    ) : (
                      carryEntries.map((entry) => {
                        const selected = Boolean(selectedCarry[entry.tempId]);

                        return (
                          <SelectableEntry
                            key={entry.tempId}
                            amber
                            selected={selected}
                            label={
                              entry.sourceLevel
                                ? `${entry.courseCode} · ${entry.sourceLevel} Level`
                                : entry.courseCode
                            }
                            onSelectedChange={(checked) =>
                              setSelectedCarry((previous) => ({
                                ...previous,

                                [entry.tempId]: checked,
                              }))
                            }
                          >
                            {selected && (
                              <EditableRow
                                entry={entry}
                                onChange={(patch) =>
                                  updateEntry("carry", entry.tempId, patch)
                                }
                              />
                            )}
                          </SelectableEntry>
                        );
                      })
                    )}
                  </div>
                </section>

                {/* OPTIONS */}

                <section className="grid min-w-0 gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5 lg:grid-cols-3">
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      Import mode
                    </p>

                    {existingCount > 0 && (
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        You already have {existingCount} timetable{" "}
                        {existingCount === 1 ? "entry" : "entries"}.
                      </p>
                    )}

                    <div className="mt-3 space-y-2 text-sm">
                      <label className="flex items-start gap-2">
                        <input
                          type="radio"
                          checked={mode === "add"}
                          onChange={() => setMode("add")}
                          className="mt-1 shrink-0"
                        />

                        <span>Add to existing timetable</span>
                      </label>

                      <label className="flex items-start gap-2">
                        <input
                          type="radio"
                          checked={mode === "replace"}
                          onChange={() => setMode("replace")}
                          className="mt-1 shrink-0"
                        />

                        <span>Replace my existing timetable</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-start gap-2 text-sm font-black">
                      <input
                        type="checkbox"
                        checked={createReminders}
                        onChange={(event) =>
                          setCreateReminders(event.target.checked)
                        }
                        className="mt-1 shrink-0"
                      />

                      <span>Create reminders for imported classes</span>
                    </label>

                    {createReminders && (
                      <div className="mt-3 flex min-w-0 gap-2">
                        <input
                          type="number"
                          min={1}
                          max={10080}
                          value={reminderValue}
                          onChange={(event) =>
                            setReminderValue(
                              Math.max(1, Number(event.target.value)),
                            )
                          }
                          className="w-20 min-w-0 rounded-xl border border-slate-300 px-3 py-2 text-sm"
                        />

                        <select
                          value={reminderUnit}
                          onChange={(event) =>
                            setReminderUnit(
                              event.target.value as "minutes" | "hours",
                            )
                          }
                          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
                        >
                          <option value="minutes">minutes before</option>

                          <option value="hours">hours before</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex items-stretch">
                    <div className="w-full rounded-2xl border border-blue-100 bg-white p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-700" />

                        <span className="text-sm font-black">
                          {selectedEntries.length} classes selected
                        </span>
                      </div>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {selectedCurrentCount} current-level +{" "}
                        {selectedCarryCount} carry-over
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}

        <footer className="shrink-0 border-t border-slate-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
          {!analysis ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={analyze.isPending}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-black text-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex min-w-0 flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={resetFile}
                disabled={confirmImport.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCcw className="h-4 w-4" />
                Choose another file
              </button>

              <div className="flex min-w-0 flex-col-reverse gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={confirmImport.isPending}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-black text-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    selectedEntries.length === 0 || confirmImport.isPending
                  }
                  onClick={() => confirmImport.mutate()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {confirmImport.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importing…
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Import {selectedEntries.length} classes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </footer>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

function UploadStage({
  pending,
  onFile,
}: {
  pending: boolean;
  onFile(file: File): void;
}) {
  return (
    <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center sm:p-10">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-700">
        {pending ? (
          <Loader2 className="h-7 w-7 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-7 w-7" />
        )}
      </div>

      <h3 className="mt-4 text-lg font-black text-slate-950">
        Choose faculty timetable
      </h3>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
        Upload CSV, XLSX, DOCX or a text-based PDF. The file is analyzed first
        and nothing is saved automatically.
      </p>

      <p className="mt-2 text-xs font-semibold text-slate-400">Maximum 10 MB</p>

      <label className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-800">
        <input
          type="file"
          className="sr-only"
          disabled={pending}
          accept=".csv,.xlsx,.docx,.pdf"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              onFile(file);
            }

            event.currentTarget.value = "";
          }}
        />

        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}

        {pending ? "Analyzing timetable…" : "Choose timetable file"}
      </label>

      <p className="mx-auto mt-5 max-w-lg text-[11px] leading-5 text-slate-400">
        Excel files are recommended where available. Scanned or image-only PDFs
        cannot be interpreted reliably without OCR.
      </p>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 min-w-0 truncate font-black capitalize text-slate-900">
        {value}
      </p>
    </div>
  );
}

function SelectableEntry({
  selected,
  onSelectedChange,
  children,
  label,
  amber = false,
}: {
  selected: boolean;

  onSelectedChange(selected: boolean): void;

  children: ReactNode;

  label?: string;

  amber?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-2xl border p-3 transition ${
        selected
          ? amber
            ? "border-amber-200 bg-amber-50/40"
            : "border-blue-200 bg-blue-50/30"
          : "border-slate-200 bg-slate-50 opacity-70"
      }`}
    >
      <label className="mb-3 flex min-w-0 cursor-pointer items-start gap-2 text-xs font-black text-slate-700">
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) => onSelectedChange(event.target.checked)}
          className="mt-0.5 shrink-0"
        />

        <span className="min-w-0 break-words">
          {label ??
            (selected ? "Include this class" : "Class excluded from import")}
        </span>
      </label>

      {children}
    </div>
  );
}

function EditableRow({
  entry,
  onChange,
  disabled = false,
}: {
  entry: ImportEntry;

  onChange(patch: Partial<ImportEntry>): void;

  disabled?: boolean;
}) {
  return (
    <div className="grid min-w-0 gap-2 md:grid-cols-[110px_minmax(160px,1fr)_125px_105px_105px_minmax(150px,1fr)]">
      <input
        aria-label="Course code"
        value={entry.courseCode}
        disabled={disabled}
        onChange={(event) =>
          onChange({
            courseCode: event.target.value.toUpperCase(),
          })
        }
        className={inputClass}
      />

      <input
        aria-label="Course title"
        value={entry.courseTitle}
        disabled={disabled}
        onChange={(event) =>
          onChange({
            courseTitle: event.target.value,
          })
        }
        className={inputClass}
      />

      <select
        aria-label="Day"
        value={entry.day}
        disabled={disabled}
        onChange={(event) =>
          onChange({
            day: event.target.value as ImportEntry["day"],
          })
        }
        className={inputClass}
      >
        <option value="monday">Monday</option>

        <option value="tuesday">Tuesday</option>

        <option value="wednesday">Wednesday</option>

        <option value="thursday">Thursday</option>

        <option value="friday">Friday</option>

        <option value="saturday">Saturday</option>

        <option value="sunday">Sunday</option>
      </select>

      <input
        aria-label="Start time"
        type="time"
        value={entry.startTime}
        disabled={disabled}
        onChange={(event) =>
          onChange({
            startTime: event.target.value,
          })
        }
        className={inputClass}
      />

      <input
        aria-label="End time"
        type="time"
        value={entry.endTime}
        disabled={disabled}
        onChange={(event) =>
          onChange({
            endTime: event.target.value,
          })
        }
        className={inputClass}
      />

      <input
        aria-label="Venue"
        value={entry.venue}
        disabled={disabled}
        onChange={(event) =>
          onChange({
            venue: event.target.value,
          })
        }
        className={inputClass}
      />

      {entry.warnings.length > 0 && (
        <p className="min-w-0 break-words text-xs font-medium leading-5 text-amber-700 md:col-span-6">
          {entry.warnings.join(" · ")}
        </p>
      )}
    </div>
  );
}
