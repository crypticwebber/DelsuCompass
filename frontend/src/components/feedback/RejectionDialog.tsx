import { AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";

export function RejectionDialog({
  open,
  title = "Reject submission",
  itemLabel = "submission",
  busy = false,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  itemLabel?: string;
  busy?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const submit = () => {
    const value = reason.trim();
    if (value.length < 5) {
      setError("Please give the student a clear reason of at least 5 characters.");
      return;
    }
    onConfirm(value);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/60 backdrop-blur-[2px] sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="rejection-dialog-title">
      <div className="max-h-[92dvh] w-full max-w-lg overflow-x-hidden overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-700"><AlertTriangle className="h-5 w-5" /></span>
            <div className="min-w-0">
              <h2 id="rejection-dialog-title" className="text-xl font-black text-slate-950">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">The reason will be sent back to the student and shown in their notification and submission history.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={busy} className="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="Close rejection dialog"><X className="h-5 w-5" /></button>
        </div>

        <label className="mt-5 block text-sm font-bold text-slate-700">
          Reason for rejecting this {itemLabel}
          <textarea
            autoFocus
            rows={5}
            maxLength={500}
            value={reason}
            onChange={(e) => { setReason(e.target.value); if (error) setError(""); }}
            placeholder="Explain what needs to be corrected before the student resubmits."
            className="mt-2 w-full min-w-0 resize-y rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-900"
          />
        </label>
        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-400"><span>{reason.trim().length}/500 characters</span><span>Required</span></div>
        {error && <p className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={busy} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700">Cancel</button>
          <button type="button" onClick={submit} disabled={busy} className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? "Rejecting…" : "Reject and notify student"}</button>
        </div>
      </div>
    </div>
  );
}
