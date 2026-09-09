import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Flag,
  Plus,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { RejectionDialog } from "@/components/feedback/RejectionDialog";
import { discoveryAdminApi, type DiscoveryKind } from "./discovery-admin.api";

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-blue-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 sm:p-12">
      {text}
    </div>
  );
}

function message(error: unknown) {
  const data = (error as any)?.response?.data;
  const fields = data?.error?.details?.fieldErrors;
  const first = fields ? Object.values(fields).flat().find(Boolean) : undefined;
  return String(first ?? data?.error?.message ?? "Something went wrong.");
}

export function DiscoveryModerationPage({ kind }: { kind: DiscoveryKind }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"posts" | "reports">("posts");
  const [status, setStatus] = useState("pending");
  const [compose, setCompose] = useState(false);
  const [rejecting, setRejecting] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const isEvents = kind === "events";

  const stats = useQuery({
    queryKey: ["admin", kind, "stats"],
    queryFn: () => discoveryAdminApi.stats(kind),
  });
  const posts = useQuery({
    queryKey: ["admin", kind, "posts", status],
    queryFn: () => discoveryAdminApi.posts(kind, status),
    enabled: tab === "posts",
  });
  const reports = useQuery({
    queryKey: ["admin", kind, "reports", status],
    queryFn: () => discoveryAdminApi.reports(kind, status),
    enabled: tab === "reports",
  });

  const refresh = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["admin", kind] }),
      qc.invalidateQueries({ queryKey: ["admin", "overview"] }),
    ]);
  };

  const moderate = useMutation({
    mutationFn: ({
      id,
      status: nextStatus,
      reason,
    }: {
      id: string;
      status: string;
      reason?: string;
    }) => discoveryAdminApi.moderate(kind, id, nextStatus, reason),
    onSuccess: async () => {
      setRejecting(null);
      await refresh();
    },
  });

  const resolve = useMutation({
    mutationFn: ({
      id,
      status: nextStatus,
    }: {
      id: string;
      status: "resolved" | "dismissed";
    }) => discoveryAdminApi.resolve(kind, id, nextStatus),
    onSuccess: refresh,
  });

  const Icon = isEvents ? CalendarDays : Sparkles;
  const statuses =
    tab === "posts"
      ? ["pending", "approved", "rejected", "archived"]
      : ["pending", "resolved", "dismissed"];
  const rows = tab === "posts" ? (posts.data ?? []) : (reports.data ?? []);

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-slate-50 p-4 sm:p-5 md:p-8">
      <section className="mx-auto min-w-0 max-w-6xl">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" /> Admin dashboard
        </Link>

        <div className="mt-5 rounded-3xl bg-gradient-to-br from-blue-700 to-blue-800 p-5 text-white shadow-lg shadow-blue-900/10 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-blue-100">
                Moderation workspace
              </p>
              <h1 className="mt-2 flex items-center gap-3 text-2xl font-semibold sm:text-3xl">
                <Icon className="h-7 w-7 sm:h-8 sm:w-8" />{" "}
                {isEvents ? "Events" : "Opportunities"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                Review student submissions and reports, or publish verified
                information directly as an administrator.
              </p>
            </div>
            <button
              onClick={() => setCompose(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-blue-800"
            >
              <Plus className="h-4 w-4" />
              Add {isEvents ? "event" : "opportunity"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Pending", stats.data?.pending ?? 0],
            ["Approved", stats.data?.approved ?? 0],
            ["Rejected", stats.data?.rejected ?? 0],
            ["Open reports", stats.data?.openReports ?? 0],
          ].map(([label, number]) => (
            <div
              key={String(label)}
              className="min-w-0 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">
                {number}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full rounded-2xl bg-blue-50 p-1 sm:w-auto">
            <button
              onClick={() => {
                setTab("posts");
                setStatus("pending");
              }}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold sm:flex-none ${tab === "posts" ? "bg-white text-blue-800 shadow-sm" : "text-slate-500"}`}
            >
              Submissions
            </button>
            <button
              onClick={() => {
                setTab("reports");
                setStatus("pending");
              }}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold sm:flex-none ${tab === "reports" ? "bg-white text-blue-800 shadow-sm" : "text-slate-500"}`}
            >
              Reports
            </button>
          </div>
          <div className="compass-scrollbar flex max-w-full gap-2 overflow-x-auto pb-1">
            {statuses.map((item) => (
              <button
                key={item}
                onClick={() => setStatus(item)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold capitalize ${status === item ? "bg-blue-700 text-white" : "border border-blue-100 bg-white text-slate-600"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {(posts.error || reports.error || moderate.error) && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
            {message(posts.error || reports.error || moderate.error)}
          </p>
        )}

        <div className="mt-4 space-y-3">
          {rows.length === 0 && (
            <Empty
              text={`No ${status} ${tab === "posts" ? "submissions" : "reports"}.`}
            />
          )}

          {tab === "posts" &&
            (posts.data ?? []).map((post: any) => (
              <article
                key={post._id}
                className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex min-w-0 flex-col gap-4 md:flex-row md:justify-between">
                  <div className="min-w-0 max-w-3xl">
                    <p className="text-xs font-semibold uppercase text-blue-700">
                      {isEvents ? post.category : post.type}
                    </p>
                    <h2 className="mt-1 break-words text-lg font-semibold text-slate-950">
                      {post.title}
                    </h2>
                    <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                      {post.description}
                    </p>
                    <p className="mt-3 break-words text-xs text-slate-400">
                      Submitted by{" "}
                      {post.submittedBy?.fullName ?? "Administrator"}
                      {isEvents ? ` · ${post.venue}` : ` · ${post.provider}`}
                    </p>
                    {post.status === "rejected" && post.rejectionReason && (
                      <div className="mt-3 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                        <strong>Rejection reason:</strong>{" "}
                        {post.rejectionReason}
                      </div>
                    )}
                  </div>
                  {post.status === "pending" && (
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
                      <button
                        disabled={moderate.isPending}
                        onClick={() =>
                          moderate.mutate({ id: post._id, status: "approved" })
                        }
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-blue-700 px-3 py-2 text-xs font-semibold text-white"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Approve
                      </button>
                      <button
                        disabled={moderate.isPending}
                        onClick={() =>
                          setRejecting({ id: post._id, title: post.title })
                        }
                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}

          {tab === "reports" &&
            (reports.data ?? []).map((report: any) => (
              <article
                key={report._id}
                className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex min-w-0 flex-col gap-4 md:flex-row md:justify-between">
                  <div className="min-w-0">
                    <p className="flex items-start gap-2 break-words text-sm font-semibold text-slate-900">
                      <Flag className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />{" "}
                      {report.reason}
                    </p>
                    <p className="mt-2 break-words text-sm text-slate-600">
                      {report.details || "No extra details supplied."}
                    </p>
                    <p className="mt-3 break-words text-xs text-slate-400">
                      Reported by {report.reportedBy?.fullName ?? "Student"} ·{" "}
                      {isEvents
                        ? report.eventId?.title
                        : report.opportunityId?.title}
                    </p>
                  </div>
                  {report.status === "pending" && (
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        onClick={() =>
                          resolve.mutate({ id: report._id, status: "resolved" })
                        }
                        className="rounded-xl bg-blue-700 px-3 py-2 text-xs font-semibold text-white"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() =>
                          resolve.mutate({
                            id: report._id,
                            status: "dismissed",
                          })
                        }
                        className="rounded-xl border px-3 py-2 text-xs font-semibold"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
        </div>
      </section>

      {compose && (
        <AdminDiscoveryForm
          kind={kind}
          close={() => setCompose(false)}
          done={async () => {
            setCompose(false);
            setTab("posts");
            setStatus("approved");
            await refresh();
          }}
        />
      )}
      <RejectionDialog
        open={Boolean(rejecting)}
        title={`Reject ${isEvents ? "event" : "opportunity"}`}
        itemLabel={isEvents ? "event" : "opportunity"}
        busy={moderate.isPending}
        onClose={() => setRejecting(null)}
        onConfirm={(reason) =>
          rejecting &&
          moderate.mutate({ id: rejecting.id, status: "rejected", reason })
        }
      />
    </main>
  );
}

function AdminDiscoveryForm({
  kind,
  close,
  done,
}: {
  kind: DiscoveryKind;
  close: () => void;
  done: () => void;
}) {
  const isEvents = kind === "events";
  const [v, setV] = useState<Record<string, string>>(() => {
    if (isEvents) {
      const eventValues: Record<string, string> = {
        title: "",
        description: "",
        category: "academic",
        startDate: "",
        endDate: "",
        venue: "",
        organizer: "",
        registrationUrl: "",
      };

      return eventValues;
    }

    const opportunityValues: Record<string, string> = {
      title: "",
      description: "",
      type: "scholarship",
      provider: "",
      deadline: "",
      eligibility: "",
      location: "",
      applicationUrl: "",
    };

    return opportunityValues;
  });
  const [localError, setLocalError] = useState("");
  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      discoveryAdminApi.create(kind, payload),
    onSuccess: done,
  });

  const set = (key: string, value: string) =>
    setV((old) => ({ ...old, [key]: value }));
  const submit = () => {
    setLocalError("");
    if ((v.title ?? "").trim().length < 4)
      return setLocalError("Title must be at least 4 characters.");
    if ((v.description ?? "").trim().length < 10)
      return setLocalError("Description must be at least 10 characters.");
    if (isEvents && !(v.startDate ?? ""))
      return setLocalError("Start date and time are required.");
    if (isEvents && (v.venue ?? "").trim().length < 2)
      return setLocalError("Venue is required.");
    if (!isEvents && (v.provider ?? "").trim().length < 2)
      return setLocalError("Provider or organization is required.");
    if (isEvents && v.endDate && new Date(v.endDate) < new Date(v.startDate))
      return setLocalError("End date must be after the start date.");

    const payload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(v))
      if (value.trim() !== "") payload[key] = value.trim();
    save.mutate(payload);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/60 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[94dvh] w-full max-w-2xl overflow-x-hidden overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-black">
              Publish {isEvents ? "event" : "opportunity"}
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Administrator entries are published immediately and do not enter
              the student moderation queue.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="shrink-0 rounded-xl p-2 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2">
          <AdminField label="Title">
            <input
              value={v.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </AdminField>
          {isEvents ? (
            <AdminField label="Category">
              <select
                value={v.category}
                onChange={(e) => set("category", e.target.value)}
              >
                {[
                  "academic",
                  "social",
                  "career",
                  "sports",
                  "religious",
                  "club",
                  "other",
                ].map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </AdminField>
          ) : (
            <AdminField label="Type">
              <select
                value={v.type}
                onChange={(e) => set("type", e.target.value)}
              >
                {[
                  "scholarship",
                  "internship",
                  "job",
                  "volunteering",
                  "competition",
                  "training",
                  "grant",
                  "other",
                ].map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </AdminField>
          )}
          {isEvents ? (
            <>
              <AdminField label="Start date & time">
                <input
                  type="datetime-local"
                  value={v.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                />
              </AdminField>
              <AdminField label="End date & time (optional)">
                <input
                  type="datetime-local"
                  value={v.endDate}
                  onChange={(e) => set("endDate", e.target.value)}
                />
              </AdminField>
              <AdminField label="Venue">
                <input
                  value={v.venue}
                  onChange={(e) => set("venue", e.target.value)}
                />
              </AdminField>
              <AdminField label="Organizer (optional)">
                <input
                  value={v.organizer}
                  onChange={(e) => set("organizer", e.target.value)}
                />
              </AdminField>
              <AdminField label="Registration URL (optional)" wide>
                <input
                  type="url"
                  value={v.registrationUrl}
                  onChange={(e) => set("registrationUrl", e.target.value)}
                />
              </AdminField>
            </>
          ) : (
            <>
              <AdminField label="Provider / organization">
                <input
                  value={v.provider}
                  onChange={(e) => set("provider", e.target.value)}
                />
              </AdminField>
              <AdminField label="Deadline (optional)">
                <input
                  type="date"
                  value={v.deadline}
                  onChange={(e) => set("deadline", e.target.value)}
                />
              </AdminField>
              <AdminField label="Location (optional)">
                <input
                  value={v.location}
                  onChange={(e) => set("location", e.target.value)}
                />
              </AdminField>
              <AdminField label="Application URL (optional)">
                <input
                  type="url"
                  value={v.applicationUrl}
                  onChange={(e) => set("applicationUrl", e.target.value)}
                />
              </AdminField>
              <AdminField label="Eligibility (optional)" wide>
                <textarea
                  rows={3}
                  value={v.eligibility}
                  onChange={(e) => set("eligibility", e.target.value)}
                />
              </AdminField>
            </>
          )}
          <AdminField label="Description" wide>
            <textarea
              rows={6}
              value={v.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </AdminField>
        </div>
        {localError && (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">
            {localError}
          </p>
        )}
        {save.error && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
            {message(save.error)}
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={close}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={save.isPending}
            className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {save.isPending
              ? "Publishing…"
              : `Publish ${isEvents ? "event" : "opportunity"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminField({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactElement;
}) {
  return (
    <label
      className={`min-w-0 text-xs font-semibold text-slate-600 ${wide ? "sm:col-span-2" : ""}`}
    >
      {label}
      <div className="mt-1 min-w-0 [&>*]:w-full [&>*]:min-w-0 [&>*]:rounded-xl [&>*]:border [&>*]:border-slate-200 [&>*]:p-3 [&>*]:text-sm [&>*]:font-normal">
        {children}
      </div>
    </label>
  );
}
