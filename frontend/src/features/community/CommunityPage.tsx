import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  AlertTriangle,
  BookOpen,
  Bus,
  Lightbulb,
  MapPin,
  MessageSquareText,
  PackageSearch,
  Plus,
  Search,
  Store,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";

import { communityApi } from "./community.api";

import type {
  CommunityCategory,
  CommunityInput,
  CommunityPost,
} from "./community.types";

/* =========================================================
   CONSTANTS
   ========================================================= */

const labels: Record<CommunityCategory, string> = {
  campus_tip: "Campus tips",
  academics: "Academics",
  transport: "Transport",
  food: "Food",
  services: "Services",
  lost_found: "Lost & found",
  general: "General",
};

const icons: Record<CommunityCategory, any> = {
  campus_tip: Lightbulb,
  academics: BookOpen,
  transport: Bus,
  food: UtensilsCrossed,
  services: Store,
  lost_found: PackageSearch,
  general: MessageSquareText,
};

const blank: CommunityInput = {
  title: "",
  body: "",
  category: "campus_tip",
  area: "",
  imageUrls: [],
};

const inputClass =
  "mt-1.5 block w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

const controlClass =
  "block h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

function err(error: unknown) {
  return (
    (error as any)?.response?.data?.error?.message ??
    "Something went wrong. Please try again."
  );
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
   COMMUNITY PAGE
   ========================================================= */

export function CommunityPage() {
  const qc = useQueryClient();

  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [mine, setMine] = useState(false);

  const [compose, setCompose] = useState<CommunityPost | "new" | null>(null);

  const [notice, setNotice] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<CommunityPost | null>(null);

  /*
   * Public community information
   *
   * We fetch the approved list without relying on the
   * UI filters. Filtering is handled locally below so
   * search and category remain reliable.
   */
  const publicQuery = useQuery({
    queryKey: ["community", "public"],
    queryFn: () => communityApi.list({}),
  });

  /*
   * User submissions
   */
  const mineQuery = useQuery({
    queryKey: ["community", "mine"],
    queryFn: communityApi.mine,
    enabled: mine,
  });

  const activeQuery = mine ? mineQuery : publicQuery;

  const rows: CommunityPost[] = activeQuery.data ?? [];

  /*
   * Search + category filtering works for both tabs.
   */
  const visible = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return rows.filter((post) => {
      const matchesCategory = !category || post.category === category;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        post.title,
        post.body,
        post.area ?? "",
        labels[post.category],
        post.submittedBy?.fullName ?? "",
        post.status ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [rows, category, search]);

  const hasFilters = Boolean(search.trim() || category);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
  };

  const del = useMutation({
    mutationFn: (id: string) => communityApi.remove(id),

    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["community"],
      });

      setDeleteTarget(null);
      setNotice("Post deleted successfully.");
    },
  });

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="min-w-0 overflow-hidden rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">
          Compass Community
        </p>

        <div className="mt-3 flex min-w-0 flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-3xl font-black">
              Useful campus knowledge, shared by students.
            </h1>

            <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-slate-300">
              Share practical DELSU and Abraka information. Every contribution
              is reviewed before it appears publicly.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCompose("new")}
            className="
              inline-flex h-11 w-full shrink-0
              items-center justify-center gap-2
              rounded-xl
              bg-blue-400
              px-5
              text-sm font-black text-slate-950
              transition
              hover:bg-blue-300
              lg:w-auto
            "
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Share information</span>
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
            aria-label="Dismiss notice"
            onClick={() => setNotice("")}
            className="
              grid h-8 w-8 shrink-0
              place-items-center
              rounded-lg
              transition
              hover:bg-blue-100
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* =====================================================
          MODE TABS
          ===================================================== */}

      <section className="min-w-0">
        <div className="grid w-full grid-cols-2 rounded-2xl bg-slate-100 p-1 sm:w-[320px]">
          <button
            type="button"
            onClick={() => setMine(false)}
            className={`
              flex h-10 min-w-0
              items-center justify-center
              rounded-xl
              px-3
              text-sm font-black
              transition
              ${
                !mine
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }
            `}
          >
            Community
          </button>

          <button
            type="button"
            onClick={() => setMine(true)}
            className={`
              flex h-10 min-w-0
              items-center justify-center
              rounded-xl
              px-3
              text-sm font-black
              transition
              ${
                mine
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }
            `}
          >
            My submissions
          </button>
        </div>
      </section>

      {/* =====================================================
          FILTERS
          ===================================================== */}

      <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div
          className="
            grid min-w-0 gap-3
            md:grid-cols-2
            xl:grid-cols-[minmax(0,1fr)_210px]
          "
        >
          {/* SEARCH */}

          <div className="relative min-w-0 md:col-span-2 xl:col-span-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                mine
                  ? "Search your submissions..."
                  : "Search tips, places, transport, services..."
              }
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

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={controlClass}
          >
            <option value="">All categories</option>

            {Object.entries(labels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* FILTER SUMMARY */}

        <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold text-slate-500">
            {activeQuery.isLoading
              ? "Loading community information..."
              : hasFilters
                ? `Showing ${visible.length} of ${rows.length} ${
                    mine ? "submissions" : "posts"
                  }`
                : `${rows.length} ${
                    mine
                      ? rows.length === 1
                        ? "submission"
                        : "submissions"
                      : rows.length === 1
                        ? "community post"
                        : "community posts"
                  }`}
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="
                inline-flex h-9
                items-center justify-center gap-1.5
                rounded-lg
                border border-slate-200
                bg-white
                px-3
                text-xs font-black text-slate-600
                transition
                hover:bg-slate-50
                hover:text-slate-950
              "
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* =====================================================
          CONTENT
          ===================================================== */}

      {activeQuery.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-52 animate-pulse rounded-3xl bg-slate-200"
            />
          ))}
        </div>
      ) : activeQuery.error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
          <p className="break-words text-sm font-bold text-red-700">
            {err(activeQuery.error)}
          </p>

          <button
            type="button"
            onClick={() => activeQuery.refetch()}
            className="mt-3 text-xs font-black text-red-700 underline"
          >
            Try again
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
          <MessageSquareText className="mx-auto h-9 w-9 text-slate-300" />

          <h2 className="mt-3 break-words font-black text-slate-950">
            {hasFilters
              ? "No posts match these filters"
              : mine
                ? "You have no submissions yet"
                : "Nothing here yet"}
          </h2>

          <p className="mx-auto mt-1 max-w-md break-words text-sm leading-6 text-slate-500">
            {hasFilters
              ? "Try a different search term or category."
              : mine
                ? "Your community contributions will appear here after you submit them."
                : "Be the first to contribute useful information."}
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          {visible.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              mine={mine}
              edit={() => setCompose(post)}
              remove={() => setDeleteTarget(post)}
              notice={setNotice}
            />
          ))}
        </div>
      )}

      {/* =====================================================
          COMPOSE MODAL
          ===================================================== */}

      {compose && (
        <Compose
          post={compose === "new" ? undefined : compose}
          close={() => setCompose(null)}
          done={() => {
            setCompose(null);

            setNotice("Submitted for administrator review.");

            void qc.invalidateQueries({
              queryKey: ["community"],
            });
          }}
        />
      )}

      {/* =====================================================
          DELETE CONFIRMATION
          ===================================================== */}

      {deleteTarget && (
        <DeletePostDialog
          post={deleteTarget}
          busy={del.isPending}
          error={del.error ? err(del.error) : null}
          close={() => {
            if (!del.isPending) {
              setDeleteTarget(null);
            }
          }}
          confirm={() => del.mutate(deleteTarget._id)}
        />
      )}
    </div>
  );
}

/* =========================================================
   POST CARD
   ========================================================= */

function PostCard({
  post,
  mine,
  edit,
  remove,
  notice,
}: {
  post: CommunityPost;
  mine: boolean;
  edit: () => void;
  remove: () => void;
  notice: (message: string) => void;
}) {
  const [report, setReport] = useState(false);

  const Icon = icons[post.category];

  return (
    <article className="flex min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      {/* HEADER */}

      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
            <Icon className="h-4 w-4" />
          </span>

          <div className="min-w-0">
            <p className="break-words text-xs font-black uppercase tracking-wide text-blue-700">
              {labels[post.category]}
            </p>

            {post.area && (
              <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-slate-400">
                <MapPin className="h-3 w-3 shrink-0" />

                <span className="min-w-0 break-words">{post.area}</span>
              </p>
            )}
          </div>
        </div>

        {mine && (
          <span
            className={`
              shrink-0 rounded-full
              px-2.5 py-1
              text-xs font-black capitalize
              ${
                post.status === "approved"
                  ? "bg-blue-100 text-blue-800"
                  : post.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-800"
              }
            `}
          >
            {post.status}
          </span>
        )}
      </div>

      {/* BODY */}

      <h2 className="mt-4 min-w-0 break-words text-lg font-black text-slate-950">
        {post.title}
      </h2>

      <p className="mt-2 line-clamp-5 min-w-0 whitespace-pre-line break-words text-sm leading-6 text-slate-600">
        {post.body}
      </p>

      {post.status === "rejected" && post.rejectionReason && (
        <p className="mt-4 min-w-0 break-words rounded-xl bg-red-50 p-3 text-xs font-bold leading-5 text-red-700">
          Reason: {post.rejectionReason}
        </p>
      )}

      {/* FOOTER */}

      <div className="mt-auto pt-5">
        <div className="flex min-w-0 flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="min-w-0 break-words text-xs font-bold text-slate-500">
              {post.submittedBy?.fullName ??
                (mine ? "You" : "Student contributor")}
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>

          {mine ? (
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
              <button
                type="button"
                onClick={edit}
                className="
                  inline-flex h-9
                  items-center justify-center
                  rounded-lg
                  border border-slate-200
                  bg-white
                  px-4
                  text-xs font-black text-slate-700
                  transition
                  hover:bg-slate-50
                "
              >
                Edit
              </button>

              <button
                type="button"
                onClick={remove}
                className="
                  inline-flex h-9
                  items-center justify-center gap-1.5
                  rounded-lg
                  border border-red-100
                  bg-white
                  px-4
                  text-xs font-black text-red-700
                  transition
                  hover:bg-red-50
                "
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setReport((current) => !current)}
              className="
                inline-flex h-9 w-full
                items-center justify-center gap-1.5
                rounded-lg
                border border-slate-200
                bg-white
                px-4
                text-xs font-black text-slate-600
                transition
                hover:bg-slate-50
                hover:text-slate-950
                sm:w-auto
              "
            >
              <AlertTriangle className="h-3.5 w-3.5" />

              {report ? "Close report" : "Report"}
            </button>
          )}
        </div>

        {report && (
          <Report
            post={post}
            close={() => setReport(false)}
            done={() => {
              setReport(false);

              notice("Report sent to an administrator.");
            }}
          />
        )}
      </div>
    </article>
  );
}

/* =========================================================
   COMPOSE MODAL
   ========================================================= */

function Compose({
  post,
  close,
  done,
}: {
  post?: CommunityPost;
  close: () => void;
  done: () => void;
}) {
  useModalLock(true);

  const [v, setV] = useState<CommunityInput>(
    post
      ? {
          title: post.title,
          body: post.body,
          category: post.category,
          area: post.area ?? "",
          imageUrls: post.imageUrls ?? [],
        }
      : blank,
  );

  const m = useMutation({
    mutationFn: () =>
      post ? communityApi.update(post._id, v) : communityApi.create(v),

    onSuccess: done,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !m.isPending) {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, m.isPending]);

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
      aria-labelledby="community-compose-title"
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
        {/* HEADER */}

        <header className="relative shrink-0 border-b border-slate-100 bg-white px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0 pr-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-blue-700">
              <MessageSquareText className="h-3.5 w-3.5" />
              Compass Community
            </div>

            <h2
              id="community-compose-title"
              className="mt-2 break-words text-xl font-black tracking-tight text-slate-950 sm:text-2xl"
            >
              {post ? "Edit contribution" : "Share with the community"}
            </h2>

            <p className="mt-1.5 max-w-xl break-words text-xs leading-5 text-slate-500 sm:text-sm">
              Approved contributions become visible to other students after
              administrator review.
            </p>
          </div>

          <button
            type="button"
            onClick={close}
            disabled={m.isPending}
            aria-label="Close community form"
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
          <div className="w-full min-w-0 p-5 sm:p-6">
            <div className="space-y-5">
              {/* CATEGORY */}

              <label className="block min-w-0 text-xs font-black text-slate-600">
                Category
                <select
                  value={v.category}
                  onChange={(e) =>
                    setV({
                      ...v,

                      category: e.target.value as CommunityCategory,
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

              {/* TITLE */}

              <label className="block min-w-0 text-xs font-black text-slate-600">
                Title
                <input
                  value={v.title}
                  onChange={(e) =>
                    setV({
                      ...v,
                      title: e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="e.g. Cheapest route from Site II to campus"
                />
              </label>

              {/* AREA */}

              <label className="block min-w-0 text-xs font-black text-slate-600">
                Area / location{" "}
                <span className="font-medium text-slate-400">(optional)</span>
                <input
                  value={v.area}
                  onChange={(e) =>
                    setV({
                      ...v,
                      area: e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="Abraka, Site II, Main Gate..."
                />
              </label>

              {/* BODY */}

              <label className="block min-w-0 text-xs font-black text-slate-600">
                Information
                <textarea
                  value={v.body}
                  onChange={(e) =>
                    setV({
                      ...v,
                      body: e.target.value,
                    })
                  }
                  rows={8}
                  className={`${inputClass} resize-y leading-6`}
                  placeholder="Write practical, specific information that can help another student."
                />
              </label>
            </div>

            {m.error && (
              <p className="mt-5 min-w-0 break-words rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-bold leading-6 text-red-700">
                {err(m.error)}
              </p>
            )}
          </div>
        </div>

        {/* FOOTER */}

        <footer className="shrink-0 border-t border-slate-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <p className="hidden max-w-sm text-[11px] leading-5 text-slate-400 lg:block">
              Student contributions remain pending until an administrator
              reviews them.
            </p>

            <div className="grid w-full grid-cols-2 gap-2 lg:ml-auto lg:flex lg:w-auto lg:items-center">
              <button
                type="button"
                onClick={close}
                disabled={m.isPending}
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
                disabled={m.isPending}
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
                  lg:min-w-[165px]
                "
              >
                {m.isPending
                  ? "Submitting..."
                  : post
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
   REPORT PANEL
   ========================================================= */

function Report({
  post,
  close,
  done,
}: {
  post: CommunityPost;
  close: () => void;
  done: () => void;
}) {
  const [reason, setReason] = useState("Information is inaccurate");

  const [details, setDetails] = useState("");

  const m = useMutation({
    mutationFn: () =>
      communityApi.report(post._id, {
        reason,
        details,
      }),

    onSuccess: done,
  });

  return (
    <div className="mt-4 min-w-0 rounded-2xl border border-red-100 bg-red-50 p-4">
      <div className="flex min-w-0 items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />

        <div className="min-w-0">
          <p className="text-sm font-black text-red-950">Report this post</p>

          <p className="mt-0.5 text-xs leading-5 text-red-700">
            Tell an administrator what is wrong with this information.
          </p>
        </div>
      </div>

      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="mt-4 block h-11 w-full min-w-0 rounded-xl border border-red-200 bg-white px-3.5 text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-red-100"
      >
        <option>Information is inaccurate</option>

        <option>Spam or advertising</option>

        <option>Potential scam</option>

        <option>Inappropriate content</option>

        <option>Outdated information</option>
      </select>

      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        rows={3}
        className="mt-3 block w-full min-w-0 resize-y rounded-xl border border-red-200 bg-white p-3 text-sm outline-none focus:ring-4 focus:ring-red-100"
        placeholder="Optional details"
      />

      {m.error && (
        <p className="mt-2 min-w-0 break-words text-xs font-bold text-red-700">
          {err(m.error)}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
        <button
          type="button"
          onClick={close}
          disabled={m.isPending}
          className="
            inline-flex h-10
            items-center justify-center
            rounded-lg
            border border-red-200
            bg-white
            px-4
            text-xs font-black text-slate-700
            transition
            hover:bg-red-50
            disabled:opacity-50
          "
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={m.isPending}
          onClick={() => m.mutate()}
          className="
            inline-flex h-10
            items-center justify-center
            rounded-lg
            bg-red-700
            px-4
            text-xs font-black text-white
            transition
            hover:bg-red-800
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {m.isPending ? "Sending..." : "Send report"}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   DELETE POST DIALOG
   ========================================================= */

function DeletePostDialog({
  post,
  busy,
  error,
  close,
  confirm,
}: {
  post: CommunityPost;
  busy: boolean;
  error: string | null;
  close: () => void;
  confirm: () => void;
}) {
  useModalLock(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
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
        px-4 py-5
        backdrop-blur-sm
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-community-post-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          close();
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
        <button
          type="button"
          onClick={close}
          disabled={busy}
          aria-label="Close delete confirmation"
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
            disabled:opacity-50
          "
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5 pr-14 sm:p-6 sm:pr-16">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
            <Trash2 className="h-5 w-5" />
          </div>

          <h2
            id="delete-community-post-title"
            className="mt-4 text-xl font-black tracking-tight text-slate-950"
          >
            Delete submission?
          </h2>

          <p className="mt-2 break-words text-sm leading-6 text-slate-500">
            You&apos;re about to permanently delete{" "}
            <strong className="font-black text-slate-800">{post.title}</strong>.
          </p>

          <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
            <p className="text-xs font-bold leading-5 text-red-700">
              This removes the community submission from your account. This
              action cannot be undone.
            </p>
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold leading-5 text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={close}
            disabled={busy}
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
              disabled:opacity-50
            "
          >
            Keep post
          </button>

          <button
            type="button"
            onClick={confirm}
            disabled={busy}
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
                Delete post
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
