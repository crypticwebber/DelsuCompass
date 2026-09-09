import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Building2,
  House,
  ImagePlus,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { accommodationApi } from "./accommodation.api";
import type {
  AccommodationInput,
  AccommodationListing,
  RoomType,
} from "./accommodation.types";
import { mediaApi } from "@/features/media/media.api";

/* =========================================================
   CONSTANTS
   ========================================================= */

const roomLabels: Record<RoomType, string> = {
  single_room: "Single room",
  self_contained: "Self-contained",
  one_bedroom: "1 bedroom",
  two_bedroom: "2 bedroom",
  shared_room: "Shared room",
  hostel: "Hostel",
  other: "Other",
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  unavailable: "bg-slate-200 text-slate-700",
};

const blank: AccommodationInput = {
  title: "",
  area: "",
  addressLandmark: "",
  annualRent: 0,
  roomType: "self_contained",
  description: "",
  facilities: [],
  distanceToCampusKm: undefined,
  waterSupply: undefined,
  electricity: undefined,
  security: undefined,
  imageUrls: [],
  contactName: "",
  contactPhone: "",
};

/* =========================================================
   HELPERS
   ========================================================= */

function money(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function readError(error: unknown) {
  const e = error as {
    response?: {
      data?: {
        error?: {
          message?: string;
        };
      };
    };
  };

  return e.response?.data?.error?.message ?? "Something went wrong.";
}

/**
 * Locks the page behind a modal.
 * This prevents the dashboard/page from continuing to scroll
 * while a dialog is visible.
 */
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

export function AccommodationPage() {
  const qc = useQueryClient();

  const [tab, setTab] = useState<"browse" | "mine">("browse");
  const [form, setForm] = useState(false);

  const [editing, setEditing] = useState<AccommodationListing | null>(null);

  const [selected, setSelected] = useState<AccommodationListing | null>(null);

  const [notice, setNotice] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    search: "",
    area: "",
    roomType: "",
    maxPrice: "",
    maxDistance: "",
    sort: "newest",
  });

  const params = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== ""),
      ),
    [filters],
  );

  const listings = useQuery({
    queryKey: ["accommodation", params],
    queryFn: () => accommodationApi.list(params),
  });

  const mine = useQuery({
    queryKey: ["accommodation", "mine"],
    queryFn: accommodationApi.mine,
  });

  const remove = useMutation({
    mutationFn: accommodationApi.remove,

    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["accommodation"],
      });

      setNotice("Listing deleted.");
    },
  });

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <section className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[.18em] text-blue-700">
            Student housing guide
          </p>

          <h1 className="mt-1 break-words text-3xl font-black tracking-tight">
            Accommodation
          </h1>

          <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-slate-500">
            Find approved accommodation around DELSU and contribute useful
            housing information for other students. Student submissions are
            reviewed before publication.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setForm(true);
          }}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800 sm:w-auto"
        >
          <Plus className="h-4 w-4 shrink-0" />
          Submit accommodation
        </button>
      </section>

      {/* =====================================================
          NOTICE
          ===================================================== */}

      {notice && (
        <div className="flex min-w-0 items-start justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900">
          <span className="min-w-0 flex-1 break-words">{notice}</span>

          <button
            type="button"
            onClick={() => setNotice(null)}
            className="shrink-0 rounded-lg p-1 hover:bg-blue-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* =====================================================
          TABS
          ===================================================== */}

      <div className="grid w-full min-w-0 grid-cols-2 rounded-2xl bg-slate-100 p-1 sm:inline-grid sm:w-auto">
        <button
          type="button"
          onClick={() => setTab("browse")}
          className={`min-w-0 rounded-xl px-3 py-2.5 text-xs font-black transition sm:px-4 sm:text-sm ${
            tab === "browse"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-500"
          }`}
        >
          Browse approved
        </button>

        <button
          type="button"
          onClick={() => setTab("mine")}
          className={`min-w-0 rounded-xl px-3 py-2.5 text-xs font-black transition sm:px-4 sm:text-sm ${
            tab === "mine"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-500"
          }`}
        >
          My submissions
        </button>
      </div>

      {/* =====================================================
          BROWSE
          ===================================================== */}

      {tab === "browse" ? (
        <>
          <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-6">
              <label className="relative min-w-0 xl:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

                <input
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      search: e.target.value,
                    })
                  }
                  placeholder="Search area, landmark or listing"
                  className="w-full min-w-0 rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500"
                />
              </label>

              <input
                value={filters.area}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    area: e.target.value,
                  })
                }
                placeholder="Area e.g. Campus 3"
                className="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />

              <select
                value={filters.roomType}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    roomType: e.target.value,
                  })
                }
                className="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              >
                <option value="">All room types</option>

                {Object.entries(roomLabels).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    maxPrice: e.target.value,
                  })
                }
                placeholder="Max annual rent"
                className="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />

              <select
                value={filters.sort}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sort: e.target.value,
                  })
                }
                className="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Lowest price</option>
                <option value="price_desc">Highest price</option>
                <option value="distance">Nearest campus</option>
              </select>
            </div>
          </section>

          {listings.isLoading ? (
            <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-80 min-w-0 animate-pulse rounded-3xl bg-slate-200"
                />
              ))}
            </div>
          ) : listings.data?.length ? (
            <div className="grid min-w-0 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {listings.data.map((listing) => (
                <ListingCard
                  key={listing._id}
                  listing={listing}
                  onOpen={() => setSelected(listing)}
                />
              ))}
            </div>
          ) : (
            <Empty />
          )}
        </>
      ) : (
        <>
          {/* =================================================
              MY SUBMISSIONS
              ================================================= */}

          <div className="min-w-0 break-words rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
            <strong>How moderation works:</strong> new or edited submissions
            remain pending until an administrator approves them. Rejected
            listings show the reason so you can correct and resubmit.
          </div>

          {mine.isLoading ? (
            <div className="h-56 animate-pulse rounded-3xl bg-slate-200" />
          ) : mine.data?.length ? (
            <div className="grid min-w-0 gap-4 lg:grid-cols-2">
              {mine.data.map((listing) => (
                <MyListingCard
                  key={listing._id}
                  listing={listing}
                  onEdit={() => {
                    setEditing(listing);
                    setForm(true);
                  }}
                  onDelete={() => {
                    if (
                      window.confirm("Delete this accommodation submission?")
                    ) {
                      remove.mutate(listing._id);
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <Empty mine />
          )}
        </>
      )}

      {/* =====================================================
          PORTAL DIALOGS
          ===================================================== */}

      {selected && (
        <ListingModal
          listing={selected}
          onClose={() => setSelected(null)}
          onNotice={setNotice}
        />
      )}

      {form && (
        <SubmissionModal
          initial={editing}
          onClose={() => {
            setForm(false);
            setEditing(null);
          }}
          onDone={async () => {
            await qc.invalidateQueries({
              queryKey: ["accommodation"],
            });

            setNotice(
              editing
                ? "Listing updated and returned to moderation."
                : "Accommodation submitted for administrator review.",
            );

            setForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

/* =========================================================
   PUBLIC LISTING CARD
   ========================================================= */

function ListingCard({
  listing,
  onOpen,
}: {
  listing: AccommodationListing;
  onOpen: () => void;
}) {
  const image = listing.imageUrls?.[0];

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] w-full min-w-0 shrink-0 overflow-hidden bg-gradient-to-br from-blue-50 to-slate-100">
        {image ? (
          <img
            src={image}
            alt={listing.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <House className="h-10 w-10 text-blue-700" />
          </div>
        )}

        <div className="absolute left-3 top-3 max-w-[75%]">
          <span className="block truncate rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black text-slate-700 shadow-sm">
            {roomLabels[listing.roomType]}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="min-w-0">
          <h3 className="line-clamp-2 break-words text-base font-black leading-6 text-slate-950 sm:text-lg">
            {listing.title}
          </h3>

          <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs font-semibold text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />

            <span className="min-w-0 truncate">{listing.area}</span>
          </p>
        </div>

        <div className="mt-4 min-w-0">
          <p className="break-words text-lg font-black leading-tight text-blue-700 sm:text-xl">
            {money(listing.annualRent)}
          </p>

          <p className="mt-1 text-[11px] font-semibold text-slate-400">
            per year
          </p>
        </div>

        <div className="mt-4 flex min-w-0 flex-wrap gap-2">
          <span className="max-w-full truncate rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
            {roomLabels[listing.roomType]}
          </span>

          {listing.distanceToCampusKm != null && (
            <span className="max-w-full truncate rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
              {listing.distanceToCampusKm} km to campus
            </span>
          )}
        </div>

        <div className="mt-auto pt-5">
          <div className="flex min-w-0 flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex min-w-0 items-center gap-1 text-xs font-bold text-slate-500">
              <Star className="h-3.5 w-3.5 shrink-0" />

              <span className="truncate">
                {listing.reviewSummary?.average
                  ? listing.reviewSummary.average.toFixed(1)
                  : "New"}{" "}
                · {listing.reviewSummary?.count ?? 0} reviews
              </span>
            </span>

            <span className="shrink-0 text-xs font-black text-slate-950">
              View details →
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   MY LISTING CARD
   ========================================================= */

function MyListingCard({
  listing,
  onEdit,
  onDelete,
}: {
  listing: AccommodationListing;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const image = listing.imageUrls?.[0];

  return (
    <article className="flex min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {image && (
        <div className="hidden w-32 shrink-0 overflow-hidden bg-slate-100 sm:block">
          <img
            src={image}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="min-w-0 flex-1 p-4 sm:p-5">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h3 className="min-w-0 break-words font-black">
                {listing.title}
              </h3>

              <span
                className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black uppercase ${
                  statusStyles[listing.status] ?? "bg-slate-100 text-slate-700"
                }`}
              >
                {listing.status}
              </span>
            </div>

            <p className="mt-1 min-w-0 break-words text-sm text-slate-500">
              {listing.area} · {money(listing.annualRent)}/year
            </p>
          </div>

          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Edit listing"
            >
              <Pencil className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="rounded-xl p-2 text-red-600 hover:bg-red-50"
              aria-label="Delete listing"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {listing.rejectionReason && (
          <div className="mt-4 min-w-0 break-words rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-800">
            <strong>Reason:</strong> {listing.rejectionReason}
          </div>
        )}

        <p className="mt-4 line-clamp-2 min-w-0 break-words text-sm leading-6 text-slate-600">
          {listing.description}
        </p>
      </div>
    </article>
  );
}

/* =========================================================
   EMPTY STATE
   ========================================================= */

function Empty({ mine = false }: { mine?: boolean }) {
  return (
    <div className="min-w-0 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-10">
      <Building2 className="mx-auto h-9 w-9 text-slate-400" />

      <h2 className="mt-3 break-words text-lg font-black">
        {mine
          ? "No submissions yet"
          : "No approved accommodation matches these filters"}
      </h2>

      <p className="mx-auto mt-2 max-w-md break-words text-sm leading-6 text-slate-500">
        {mine
          ? "Contribute accommodation information and it will be reviewed before students can see it."
          : "Try changing your search or filters."}
      </p>
    </div>
  );
}

/* =========================================================
   SUBMIT / EDIT ACCOMMODATION MODAL
   IMPORTANT: RENDERED DIRECTLY INTO DOCUMENT.BODY
   ========================================================= */

function SubmissionModal({
  initial,
  onClose,
  onDone,
}: {
  initial: AccommodationListing | null;
  onClose: () => void;
  onDone: () => void;
}) {
  useModalLock(true);

  const [v, setV] = useState<AccommodationInput>(
    initial
      ? {
          title: initial.title,
          area: initial.area,
          addressLandmark: initial.addressLandmark,
          annualRent: initial.annualRent,
          roomType: initial.roomType,
          description: initial.description,
          facilities: initial.facilities,
          distanceToCampusKm: initial.distanceToCampusKm,
          waterSupply: initial.waterSupply as any,
          electricity: initial.electricity as any,
          security: initial.security as any,
          imageUrls: initial.imageUrls ?? [],
          contactName: initial.contactName,
          contactPhone: initial.contactPhone,
        }
      : blank,
  );

  const [fac, setFac] = useState(initial?.facilities.join(", ") ?? "");

  const upload = useMutation({
    mutationFn: mediaApi.uploadImage,

    onSuccess: (result) =>
      setV((current) => ({
        ...current,
        imageUrls: [...current.imageUrls, result.url].slice(0, 8),
      })),
  });

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        ...v,

        facilities: fac
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        distanceToCampusKm:
          v.distanceToCampusKm == null ? undefined : v.distanceToCampusKm,
      };

      return initial
        ? accommodationApi.update(initial._id, payload)
        : accommodationApi.create(payload);
    },

    onSuccess: onDone,
  });

  /*
   * Escape key closes dialog.
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !save.isPending) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, save.isPending]);

  const modal = (
    <div
      className="fixed left-0 top-0 z-[9999] flex h-[100dvh] w-screen items-start justify-center overflow-hidden bg-slate-950/75 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-5 sm:py-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accommodation-modal-title"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !save.isPending &&
          !upload.isPending
        ) {
          onClose();
        }
      }}
    >
      <div
        className="relative flex h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.35)] sm:h-auto sm:max-h-[calc(100dvh-2.5rem)] sm:rounded-3xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* =================================================
            MODAL HEADER
            ================================================= */}

        <div className="relative shrink-0 border-b border-slate-100 bg-white px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0 pr-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-blue-700">
              <House className="h-3.5 w-3.5" />
              Student housing
            </div>

            <h2
              id="accommodation-modal-title"
              className="mt-2 break-words text-xl font-black tracking-tight text-slate-950 sm:text-2xl"
            >
              {initial ? "Edit accommodation" : "Submit accommodation"}
            </h2>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
              Share accurate accommodation information with DELSU students. Your
              submission will be reviewed before it becomes publicly visible.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={save.isPending || upload.isPending}
            aria-label="Close accommodation form"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* =================================================
            SCROLLABLE CONTENT
            ================================================= */}

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div className="w-full min-w-0 p-5 sm:p-6">
            {/* BASIC INFORMATION */}

            <section className="min-w-0">
              <div className="mb-4">
                <h3 className="text-sm font-black text-slate-900">
                  Basic information
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Tell students what the accommodation is and where it is
                  located.
                </p>
              </div>

              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <FormField label="Listing title">
                  <input
                    type="text"
                    value={v.title}
                    onChange={(e) =>
                      setV({
                        ...v,
                        title: e.target.value,
                      })
                    }
                    placeholder="e.g. Self-contained room near Campus 3"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Area">
                  <input
                    type="text"
                    value={v.area}
                    onChange={(e) =>
                      setV({
                        ...v,
                        area: e.target.value,
                      })
                    }
                    placeholder="e.g. Campus 3"
                    className={inputClass}
                  />
                </FormField>

                <div className="min-w-0 sm:col-span-2">
                  <FormField label="Address / nearby landmark">
                    <input
                      type="text"
                      value={v.addressLandmark}
                      onChange={(e) =>
                        setV({
                          ...v,
                          addressLandmark: e.target.value,
                        })
                      }
                      placeholder="Street, junction or nearby landmark"
                      className={inputClass}
                    />
                  </FormField>
                </div>

                <FormField label="Annual rent (₦)">
                  <input
                    type="number"
                    min="0"
                    value={v.annualRent}
                    onChange={(e) =>
                      setV({
                        ...v,
                        annualRent: Number(e.target.value),
                      })
                    }
                    placeholder="e.g. 250000"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Room type">
                  <select
                    value={v.roomType}
                    onChange={(e) =>
                      setV({
                        ...v,
                        roomType: e.target.value as RoomType,
                      })
                    }
                    className={inputClass}
                  >
                    {Object.entries(roomLabels).map(([value, label]) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            </section>

            {/* PROPERTY INFORMATION */}

            <section className="mt-7 border-t border-slate-100 pt-6">
              <div className="mb-4">
                <h3 className="text-sm font-black text-slate-900">
                  Property information
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Add practical details students need when comparing housing.
                </p>
              </div>

              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <FormField label="Distance to campus (optional)">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={v.distanceToCampusKm ?? ""}
                      onChange={(e) =>
                        setV({
                          ...v,
                          distanceToCampusKm:
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                        })
                      }
                      placeholder="e.g. 1.5"
                      className={`${inputClass} pr-12`}
                    />

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      km
                    </span>
                  </div>

                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Leave blank if you are unsure.
                  </p>
                </FormField>

                <FormField label="Water supply">
                  <select
                    value={v.waterSupply ?? ""}
                    onChange={(e) =>
                      setV({
                        ...v,
                        waterSupply: (e.target.value as any) || undefined,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="">Not specified</option>
                    <option value="poor">Poor</option>
                    <option value="fair">Fair</option>
                    <option value="good">Good</option>
                    <option value="very_good">Very good</option>
                  </select>
                </FormField>

                <FormField label="Electricity">
                  <select
                    value={v.electricity ?? ""}
                    onChange={(e) =>
                      setV({
                        ...v,
                        electricity: (e.target.value as any) || undefined,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="">Not specified</option>
                    <option value="poor">Poor</option>
                    <option value="fair">Fair</option>
                    <option value="good">Good</option>
                    <option value="very_good">Very good</option>
                  </select>
                </FormField>

                <FormField label="Security">
                  <select
                    value={v.security ?? ""}
                    onChange={(e) =>
                      setV({
                        ...v,
                        security: (e.target.value as any) || undefined,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="">Not specified</option>
                    <option value="poor">Poor</option>
                    <option value="fair">Fair</option>
                    <option value="good">Good</option>
                    <option value="very_good">Very good</option>
                  </select>
                </FormField>

                <div className="min-w-0 sm:col-span-2">
                  <FormField label="Facilities">
                    <input
                      value={fac}
                      onChange={(e) => setFac(e.target.value)}
                      placeholder="Water, fenced compound, wardrobe, tiles"
                      className={inputClass}
                    />

                    <p className="mt-1.5 text-[11px] text-slate-400">
                      Separate facilities using commas.
                    </p>
                  </FormField>
                </div>

                <div className="min-w-0 sm:col-span-2">
                  <FormField label="Description">
                    <textarea
                      value={v.description}
                      onChange={(e) =>
                        setV({
                          ...v,
                          description: e.target.value,
                        })
                      }
                      rows={5}
                      placeholder="Describe the room, compound, environment and any other useful information..."
                      className={`${inputClass} resize-y leading-6`}
                    />
                  </FormField>
                </div>
              </div>
            </section>

            {/* PHOTOS */}

            <section className="mt-7 border-t border-slate-100 pt-6">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-900">
                    Accommodation photos
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Add up to 8 photos. The first image becomes the listing
                    cover.
                  </p>
                </div>

                <label
                  className={`inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black transition sm:w-auto ${
                    upload.isPending || v.imageUrls.length >= 8
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : "cursor-pointer border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    disabled={upload.isPending || v.imageUrls.length >= 8}
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

                  {upload.isPending ? "Uploading..." : "Add photo"}
                </label>
              </div>

              {upload.error && (
                <div className="mt-3 break-words rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold leading-5 text-red-700">
                  {readError(upload.error)}
                </div>
              )}

              {v.imageUrls.length > 0 ? (
                <div className="mt-4 grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {v.imageUrls.map((url, index) => (
                    <div
                      key={url}
                      className="group relative aspect-[4/3] min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                    >
                      <img
                        src={url}
                        alt={`Accommodation ${index + 1}`}
                        className="absolute inset-0 h-full w-full object-cover"
                      />

                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 rounded-lg bg-slate-950/80 px-2 py-1 text-[9px] font-black uppercase text-white">
                          Cover
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setV({
                            ...v,
                            imageUrls: v.imageUrls.filter(
                              (image) => image !== url,
                            ),
                          })
                        }
                        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/95 text-slate-700 shadow-md transition hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 grid min-h-28 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
                  <div>
                    <ImagePlus className="mx-auto h-6 w-6 text-slate-300" />

                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      No photos added yet
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      Photos are optional but help students evaluate a listing.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* CONTACT */}

            <section className="mt-7 border-t border-slate-100 pt-6">
              <div className="mb-4">
                <h3 className="text-sm font-black text-slate-900">
                  Contact information
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Provide contact details students can use to ask questions or
                  arrange an inspection.
                </p>
              </div>

              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <FormField label="Contact name">
                  <input
                    type="text"
                    value={v.contactName}
                    onChange={(e) =>
                      setV({
                        ...v,
                        contactName: e.target.value,
                      })
                    }
                    placeholder="Name"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Contact phone">
                  <input
                    type="tel"
                    value={v.contactPhone}
                    onChange={(e) =>
                      setV({
                        ...v,
                        contactPhone: e.target.value,
                      })
                    }
                    placeholder="e.g. 08012345678"
                    className={inputClass}
                  />
                </FormField>
              </div>
            </section>

            {save.error && (
              <div className="mt-6 break-words rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
                {readError(save.error)}
              </div>
            )}

            <div className="h-4" />
          </div>
        </div>

        {/* =================================================
            FOOTER
            ================================================= */}

        <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="hidden max-w-sm text-[11px] leading-5 text-slate-400 sm:block">
              Your listing remains pending until an administrator reviews and
              approves it.
            </p>

            <div className="flex min-w-0 flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                disabled={save.isPending || upload.isPending}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={save.isPending || upload.isPending}
                onClick={() => save.mutate()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}

                {save.isPending
                  ? "Submitting..."
                  : initial
                    ? "Update listing"
                    : "Submit for review"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

/* =========================================================
   LISTING DETAILS MODAL
   ALSO USES PORTAL
   ========================================================= */

function ListingModal({
  listing,
  onClose,
  onNotice,
}: {
  listing: AccommodationListing;
  onClose: () => void;
  onNotice: (x: string) => void;
}) {
  useModalLock(true);

  const detail = useQuery({
    queryKey: ["accommodation", "detail", listing._id],
    queryFn: () => accommodationApi.detail(listing._id),
  });

  const [review, setReview] = useState(false);
  const [report, setReport] = useState(false);

  const image = listing.imageUrls?.[0];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const modal = (
    <div
      className="fixed left-0 top-0 z-[9999] flex h-[100dvh] w-screen items-start justify-center overflow-hidden bg-slate-950/75 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-5 sm:py-5"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="flex h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:h-auto sm:max-h-[calc(100dvh-2.5rem)] sm:rounded-3xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="relative aspect-[16/8] w-full shrink-0 overflow-hidden bg-gradient-to-br from-blue-50 to-slate-100 sm:aspect-[16/6]">
          {image ? (
            <img
              src={image}
              alt={listing.title}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          ) : (
            <House className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-blue-700" />
          )}

          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-slate-700 shadow sm:right-4 sm:top-4"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-5 sm:p-6">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="break-words text-xl font-black sm:text-2xl">
                {listing.title}
              </h2>

              <p className="mt-2 flex min-w-0 items-start gap-1.5 text-sm text-slate-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                <span className="min-w-0 break-words">
                  {listing.addressLandmark}, {listing.area}
                </span>
              </p>
            </div>

            <div className="min-w-0 shrink-0">
              <p className="break-words text-xl font-black text-blue-700">
                {money(listing.annualRent)}
              </p>

              <span className="text-xs text-slate-400">/ year</span>
            </div>
          </div>

          <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-3">
            {[
              ["Water", listing.waterSupply],
              ["Electricity", listing.electricity],
              ["Security", listing.security],
            ].map(([label, value]) => (
              <div className="min-w-0 rounded-2xl bg-slate-50 p-4" key={label}>
                <p className="text-xs font-bold text-slate-500">{label}</p>

                <p className="mt-1 break-words font-black capitalize">
                  {String(value ?? "Not specified").replace("_", " ")}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-5 min-w-0 break-words text-sm leading-7 text-slate-600">
            {listing.description}
          </p>

          {listing.facilities.length > 0 && (
            <div className="mt-4 flex min-w-0 flex-wrap gap-2">
              {listing.facilities.map((facility) => (
                <span
                  key={facility}
                  className="max-w-full break-words rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800"
                >
                  {facility}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 min-w-0 rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Contact provided by submitter
            </p>

            <p className="mt-2 break-words font-black">{listing.contactName}</p>

            <p className="break-all text-sm text-slate-600">
              {listing.contactPhone}
            </p>

            <p className="mt-2 break-words text-xs leading-5 text-slate-500">
              DELSU Compass moderation checks content quality but does not
              guarantee landlords, agents, payments or property availability.
              Students should inspect accommodation before making payment.
            </p>
          </div>

          <div className="mt-6 flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link
              to={`/app/map?q=${encodeURIComponent(listing.area)}`}
              className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-center text-sm font-black text-blue-800"
            >
              <MapPin className="h-4 w-4 shrink-0" />
              Find this area on Compass Map
            </Link>

            <button
              type="button"
              onClick={() => setReview(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white"
            >
              <Star className="h-4 w-4" />
              Review
            </button>

            <button
              type="button"
              onClick={() => setReport(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-red-700"
            >
              <AlertTriangle className="h-4 w-4" />
              Report listing
            </button>
          </div>

          <section className="mt-7 border-t border-slate-100 pt-6">
            <div className="flex min-w-0 items-center gap-2">
              <ShieldCheck className="h-5 w-5 shrink-0 text-blue-700" />

              <h3 className="break-words font-black">Student reviews</h3>
            </div>

            {detail.isLoading ? (
              <p className="mt-3 text-sm text-slate-500">Loading reviews...</p>
            ) : detail.data?.reviews.length ? (
              <div className="mt-4 space-y-3">
                {detail.data.reviews.map((item) => (
                  <article
                    key={item._id}
                    className="min-w-0 rounded-2xl bg-slate-50 p-4"
                  >
                    <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <strong className="min-w-0 break-words text-sm">
                        {item.userId?.fullName ?? "Student"}
                      </strong>

                      <span className="shrink-0 text-sm font-black">
                        ★ {item.rating}/5
                      </span>
                    </div>

                    {item.comment && (
                      <p className="mt-2 min-w-0 break-words text-sm leading-6 text-slate-600">
                        {item.comment}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                No approved student reviews yet.
              </p>
            )}
          </section>
        </div>

        {review && (
          <ReviewDialog
            id={listing._id}
            close={() => setReview(false)}
            done={() => {
              setReview(false);
              onNotice("Review submitted for moderation.");
            }}
          />
        )}

        {report && (
          <ReportDialog
            id={listing._id}
            close={() => setReport(false)}
            done={() => {
              setReport(false);

              onNotice(
                "Thanks. Your report has been sent to an administrator.",
              );
            }}
          />
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

/* =========================================================
   REVIEW
   ========================================================= */

function ReviewDialog({
  id,
  close,
  done,
}: {
  id: string;
  close: () => void;
  done: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      accommodationApi.review(id, {
        rating,
        comment,
      }),

    onSuccess: done,
  });

  return (
    <div className="shrink-0 border-t bg-white p-4 shadow-2xl sm:p-5">
      <h3 className="font-black">Review this accommodation</h3>

      <div className="mt-3 grid grid-cols-5 gap-1.5 sm:flex sm:gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => setRating(n)}
            className={`min-w-0 rounded-lg px-2 py-2 font-black sm:px-3 ${
              n <= rating ? "bg-amber-100 text-amber-700" : "bg-slate-100"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Share practical information about price, water, power, security or environment."
        className="mt-3 block w-full min-w-0 rounded-xl border border-slate-200 p-3 text-sm"
      />

      {mutation.error && (
        <p className="mt-2 break-words text-sm font-bold text-red-700">
          {readError(mutation.error)}
        </p>
      )}

      <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={close}
          className="rounded-xl border px-4 py-2 text-sm font-bold"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
          className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {mutation.isPending ? "Submitting..." : "Submit review"}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   REPORT
   ========================================================= */

function ReportDialog({
  id,
  close,
  done,
}: {
  id: string;
  close: () => void;
  done: () => void;
}) {
  const [reason, setReason] = useState("Information is inaccurate");
  const [details, setDetails] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      accommodationApi.report(id, {
        reason,
        details,
      }),

    onSuccess: done,
  });

  return (
    <div className="shrink-0 border-t bg-white p-4 shadow-2xl sm:p-5">
      <h3 className="font-black">Report this listing</h3>

      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="mt-3 block w-full min-w-0 rounded-xl border border-slate-200 p-3 text-sm"
      >
        <option>Information is inaccurate</option>
        <option>Listing may be fraudulent</option>
        <option>Accommodation is no longer available</option>
        <option>Duplicate listing</option>
        <option>Inappropriate content</option>
      </select>

      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        rows={3}
        placeholder="Add details that can help the administrator review this report."
        className="mt-3 block w-full min-w-0 rounded-xl border border-slate-200 p-3 text-sm"
      />

      {mutation.error && (
        <p className="mt-2 break-words text-sm font-bold text-red-700">
          {readError(mutation.error)}
        </p>
      )}

      <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={close}
          className="rounded-xl border px-4 py-2 text-sm font-bold"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
          className="rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {mutation.isPending ? "Sending..." : "Send report"}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   FORM HELPERS
   ========================================================= */

const inputClass =
  "mt-1.5 block w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-xs font-bold text-slate-600">{label}</span>
      {children}
    </label>
  );
}
