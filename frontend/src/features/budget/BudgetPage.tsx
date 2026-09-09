import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  CalendarDays,
  CircleDollarSign,
  Pencil,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingDown,
  WalletCards,
  X,
} from "lucide-react";

import { budgetApi } from "./budget.api";

import {
  expenseCategories,
  type BudgetPlan,
  type Expense,
  type ExpenseCategory,
  type ExpenseInput,
  type PaymentMethod,
} from "./budget.types";

/* =========================================================
   CONSTANTS
   ========================================================= */

const labels: Record<ExpenseCategory, string> = {
  food: "Food",
  transport: "Transport",
  accommodation: "Accommodation",
  academics: "Academics",
  data_airtime: "Data & airtime",
  utilities: "Utilities",
  health: "Health",
  entertainment: "Entertainment",
  personal: "Personal",
  other: "Other",
};

const paymentLabels: Record<PaymentMethod, string> = {
  cash: "Cash",
  bank_transfer: "Bank transfer",
  card: "Card",
  mobile_money: "Mobile money",
  other: "Other",
};

const money = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount || 0);

function currentMonth() {
  const date = new Date();

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function readError(error: unknown) {
  return (
    (error as any)?.response?.data?.error?.message ??
    "Something went wrong. Please try again."
  );
}

const inputClass =
  "mt-1.5 block w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

const controlClass =
  "block h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

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

export function BudgetPage() {
  const queryClient = useQueryClient();

  const [month, setMonth] = useState(currentMonth());

  const [category, setCategory] = useState("");

  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState<Expense | "new" | null>(null);

  const [planOpen, setPlanOpen] = useState(false);

  const [notice, setNotice] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  /* ---------------------------------------------------------
     SUMMARY
     --------------------------------------------------------- */

  const summary = useQuery({
    queryKey: ["budget-summary", month],

    queryFn: () => budgetApi.summary(month),
  });

  /* ---------------------------------------------------------
     EXPENSES

     Fetch monthly expenses once. Search/category filtering
     happens locally so the controls remain reliable.
     --------------------------------------------------------- */

  const expenses = useQuery({
    queryKey: ["expenses", month],

    queryFn: () => budgetApi.expenses(month, {}),
  });

  const rows: Expense[] = expenses.data ?? [];

  /* ---------------------------------------------------------
     LOCAL FILTERING
     --------------------------------------------------------- */

  const visibleExpenses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return rows.filter((expense) => {
      const matchesCategory = !category || expense.category === category;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        expense.description,
        labels[expense.category],
        paymentLabels[expense.paymentMethod],
        expense.notes ?? "",
        money(expense.amount),
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

  /* ---------------------------------------------------------
     INVALIDATION
     --------------------------------------------------------- */

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["budget-summary", month],
      }),

      queryClient.invalidateQueries({
        queryKey: ["expenses", month],
      }),

      queryClient.invalidateQueries({
        queryKey: ["budget-plan", month],
      }),
    ]);
  };

  /* ---------------------------------------------------------
     DELETE
     --------------------------------------------------------- */

  const remove = useMutation({
    mutationFn: (id: string) => budgetApi.deleteExpense(id),

    onSuccess: async () => {
      await invalidate();

      setDeleteTarget(null);

      setNotice("Expense deleted successfully.");
    },
  });

  const openDeleteDialog = (expense: Expense) => {
    remove.reset();
    setDeleteTarget(expense);
  };

  const closeDeleteDialog = () => {
    if (remove.isPending) {
      return;
    }

    remove.reset();
    setDeleteTarget(null);
  };

  /* ---------------------------------------------------------
     SUMMARY VALUES
     --------------------------------------------------------- */

  const data = summary.data;

  const spendingLimit = data?.plan?.spendingLimit ?? 0;

  const totalSpent = data?.totalSpent ?? 0;

  const percent =
    spendingLimit > 0 ? Math.min((totalSpent / spendingLimit) * 100, 100) : 0;

  const categoryData = useMemo(
    () =>
      (data?.byCategory ?? []).map((item) => ({
        name: labels[item.category],

        amount: item.total,
      })),
    [data],
  );

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="min-w-0 overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-700 to-blue-900 p-6 text-white shadow-lg shadow-blue-900/10 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
          Student budget
        </p>

        <div className="mt-3 flex min-w-0 flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="max-w-2xl break-words text-3xl font-semibold tracking-[-0.03em]">
              Plan your month without losing track of the small spending.
            </h1>

            <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-blue-100/85">
              Set a private monthly plan, record expenses and see how your
              spending changes over time.
            </p>
          </div>

          {/* HERO ACTIONS */}

          <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:min-w-[290px]">
            <button
              type="button"
              onClick={() => setPlanOpen(true)}
              className="
                inline-flex h-11 min-w-0
                items-center justify-center
                rounded-xl
                border border-white/25
                bg-white/10
                px-4
                text-sm font-semibold
                text-white
                transition
                hover:bg-white/15
              "
            >
              Set budget
            </button>

            <button
              type="button"
              onClick={() => setEditing("new")}
              className="
                inline-flex h-11 min-w-0
                items-center justify-center
                gap-2
                rounded-xl
                bg-white
                px-4
                text-sm font-semibold
                text-blue-800
                transition
                hover:bg-blue-50
              "
            >
              <Plus className="h-4 w-4 shrink-0" />

              <span>Add expense</span>
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          NOTICE
          ===================================================== */}

      {notice && (
        <div className="flex min-w-0 items-start justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
          <span className="min-w-0 flex-1 break-words">{notice}</span>

          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setNotice("")}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg transition hover:bg-blue-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* =====================================================
          QUERY ERROR
          ===================================================== */}

      {(summary.error || expenses.error) && (
        <div className="break-words rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {readError(summary.error || expenses.error)}
        </div>
      )}

      {/* =====================================================
          MONTH SELECTOR
          ===================================================== */}

      <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-blue-700" />

              <p className="text-sm font-semibold text-slate-900">
                Budget month
              </p>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              View the plan and expenses recorded for a specific month.
            </p>
          </div>

          <input
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            className="block h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 md:w-[190px]"
          />
        </div>

        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-xs font-medium text-slate-400">
            Your budget and expense records are private to your account.
          </p>
        </div>
      </section>

      {/* =====================================================
          STATISTICS
          ===================================================== */}

      <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={WalletCards}
          label="Monthly limit"
          value={money(spendingLimit)}
        />

        <Stat icon={TrendingDown} label="Spent" value={money(totalSpent)} />

        <Stat
          icon={CircleDollarSign}
          label={data?.overspent ? "Over budget" : "Remaining"}
          value={money(data?.overspent || data?.remaining || 0)}
        />

        <Stat
          icon={Target}
          label="Savings goal"
          value={money(data?.plan?.savingsGoal ?? 0)}
        />
      </section>

      {/* =====================================================
          MONTHLY PROGRESS
          ===================================================== */}

      <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex min-w-0 items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-950">
              Monthly progress
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {data?.transactionCount ?? 0} recorded{" "}
              {(data?.transactionCount ?? 0) === 1 ? "expense" : "expenses"}
            </p>
          </div>

          <strong className="shrink-0 text-sm text-slate-700">
            {Math.round(percent)}%
          </strong>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-700 transition-all duration-300"
            style={{
              width: `${percent}%`,
            }}
          />
        </div>

        {!data?.plan && (
          <div className="mt-4 flex min-w-0 flex-col gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0 break-words text-sm font-medium text-amber-800">
              No budget plan has been set for {month}.
            </p>

            <button
              type="button"
              onClick={() => setPlanOpen(true)}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white px-4 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
            >
              Create budget
            </button>
          </div>
        )}

        {data?.overspent ? (
          <p className="mt-3 break-words text-xs font-semibold text-red-700">
            You are {money(data.overspent)} above your monthly spending limit.
          </p>
        ) : null}
      </section>

      {/* =====================================================
          CHARTS
          ===================================================== */}

      <section className="grid min-w-0 gap-5 xl:grid-cols-2">
        <ChartCard title="Daily spending" empty={!data?.daily?.length}>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data?.daily ?? []}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="date"
                tick={{
                  fontSize: 10,
                }}
              />

              <YAxis
                width={52}
                tick={{
                  fontSize: 10,
                }}
              />

              <Tooltip formatter={(value) => money(Number(value))} />

              <Area
                type="monotone"
                dataKey="total"
                stroke="currentColor"
                fill="currentColor"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Spending by category" empty={!categoryData.length}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="name"
                tick={{
                  fontSize: 9,
                }}
                interval={0}
              />

              <YAxis
                width={52}
                tick={{
                  fontSize: 10,
                }}
              />

              <Tooltip formatter={(value) => money(Number(value))} />

              <Bar dataKey="amount" fill="currentColor" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* =====================================================
          EXPENSE SECTION
          ===================================================== */}

      <section className="min-w-0 space-y-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Expenses
          </h2>

          <p className="text-xs leading-5 text-slate-500">
            Review and manage the expenses recorded for {month}.
          </p>
        </div>

        {/* FILTERS */}

        <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div
            className="
              grid min-w-0 gap-3
              md:grid-cols-2
              xl:grid-cols-[minmax(0,1fr)_220px]
            "
          >
            <div className="relative min-w-0 md:col-span-2 xl:col-span-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search expenses..."
                className="
                  block h-11
                  w-full min-w-0
                  rounded-xl
                  border border-slate-200
                  bg-white
                  py-2.5 pl-10 pr-4
                  text-sm
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-50
                "
              />
            </div>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={controlClass}
            >
              <option value="">All categories</option>

              {expenseCategories.map((item) => (
                <option key={item} value={item}>
                  {labels[item]}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <p className="text-xs font-medium text-slate-500">
              {expenses.isLoading
                ? "Loading expenses..."
                : hasFilters
                  ? `Showing ${visibleExpenses.length} of ${rows.length} expenses`
                  : `${rows.length} ${
                      rows.length === 1 ? "expense" : "expenses"
                    }`}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                <X className="h-3.5 w-3.5" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* EXPENSE CONTENT */}

        {expenses.isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        ) : expenses.error ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-5">
            <p className="break-words text-sm font-semibold text-red-700">
              {readError(expenses.error)}
            </p>

            <button
              type="button"
              onClick={() => expenses.refetch()}
              className="mt-3 text-xs font-semibold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        ) : visibleExpenses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-10">
            <CircleDollarSign className="mx-auto h-10 w-10 text-slate-300" />

            <h2 className="mt-3 font-semibold text-slate-950">
              {hasFilters
                ? "No expenses match these filters"
                : "No expenses recorded"}
            </h2>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
              {hasFilters
                ? "Try a different search term or category."
                : "Add your first expense to start tracking your spending."}
            </p>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setEditing("new")}
                className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                <Plus className="h-4 w-4" />
                Add expense
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {visibleExpenses.map((expense) => (
              <ExpenseRow
                key={expense._id}
                row={expense}
                edit={() => setEditing(expense)}
                remove={() => openDeleteDialog(expense)}
              />
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          BUDGET PLAN MODAL
          ===================================================== */}

      {planOpen && (
        <PlanModal
          month={month}
          close={() => setPlanOpen(false)}
          done={async (saved) => {
            queryClient.setQueryData(["budget-plan", month], saved);

            setPlanOpen(false);

            setNotice("Monthly budget saved successfully.");

            await invalidate();
          }}
        />
      )}

      {/* =====================================================
          EXPENSE MODAL
          ===================================================== */}

      {editing && (
        <ExpenseModal
          row={editing === "new" ? undefined : editing}
          close={() => setEditing(null)}
          done={async () => {
            const wasNew = editing === "new";

            setEditing(null);

            setNotice(
              wasNew
                ? "Expense recorded successfully."
                : "Expense updated successfully.",
            );

            await invalidate();
          }}
        />
      )}

      {/* =====================================================
          DELETE DIALOG
          ===================================================== */}

      {deleteTarget && (
        <DeleteExpenseDialog
          expense={deleteTarget}
          pending={remove.isPending}
          error={remove.error ? readError(remove.error) : null}
          close={closeDeleteDialog}
          confirm={() => remove.mutate(deleteTarget._id)}
        />
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
   ========================================================= */

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <article className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-4 text-xs font-medium text-slate-500">{label}</p>

      <p className="mt-1 min-w-0 break-words text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </article>
  );
}

/* =========================================================
   CHART CARD
   ========================================================= */

function ChartCard({
  title,
  children,
  empty,
}: {
  title: string;
  children: ReactNode;
  empty: boolean;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 break-words text-lg font-semibold text-slate-950">
        {title}
      </h2>

      {empty ? (
        <div className="grid h-[250px] place-items-center rounded-2xl bg-slate-50 px-4 text-center">
          <div>
            <p className="text-sm font-semibold text-slate-600">
              Nothing to chart yet
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Record an expense and this chart will update.
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </section>
  );
}

/* =========================================================
   EXPENSE ROW
   ========================================================= */

function ExpenseRow({
  row,
  edit,
  remove,
}: {
  row: Expense;
  edit: () => void;
  remove: () => void;
}) {
  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300">
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        {/* EXPENSE INFORMATION */}

        <div className="min-w-0">
          <p className="min-w-0 break-words font-semibold text-slate-950">
            {row.description}
          </p>

          <p className="mt-1 min-w-0 break-words text-xs font-medium leading-5 text-slate-500">
            {labels[row.category]} ·{" "}
            {new Date(row.spentAt).toLocaleDateString()} ·{" "}
            {paymentLabels[row.paymentMethod]}
          </p>

          {row.notes && (
            <p className="mt-2 line-clamp-2 break-words text-xs leading-5 text-slate-400">
              {row.notes}
            </p>
          )}
        </div>

        {/* AMOUNT + ACTIONS */}

        <div className="grid min-w-0 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-[auto_1fr] sm:items-center lg:flex lg:shrink-0 lg:border-t-0 lg:pt-0">
          <strong className="break-words text-base font-semibold text-slate-950 sm:pr-2">
            {money(row.amount)}
          </strong>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <button
              type="button"
              onClick={edit}
              className="inline-flex h-9 min-w-[86px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>

            <button
              type="button"
              onClick={remove}
              className="inline-flex h-9 min-w-[86px] items-center justify-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 text-xs font-semibold text-red-700 transition hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   BUDGET PLAN MODAL
   ========================================================= */

function PlanModal({
  month,
  close,
  done,
}: {
  month: string;
  close: () => void;
  done: (saved: BudgetPlan) => void;
}) {
  const query = useQuery({
    queryKey: ["budget-plan", month],

    queryFn: () => budgetApi.getPlan(month),
  });

  const [value, setValue] = useState<BudgetPlan>({
    month,
    expectedIncome: 0,
    spendingLimit: 0,
    savingsGoal: 0,
    categoryAllocations: [],
    notes: "",
  });

  useEffect(() => {
    if (!query.data) {
      return;
    }

    setValue({
      ...query.data,
      month,

      categoryAllocations: query.data.categoryAllocations ?? [],
    });
  }, [query.data, month]);

  const mutation = useMutation({
    mutationFn: () => budgetApi.savePlan(value),

    onSuccess: done,
  });

  return (
    <Modal
      title="Set monthly budget"
      subtitle={`Budget plan for ${month}`}
      close={close}
      preventClose={mutation.isPending}
      footer={
        <Actions
          close={close}
          pending={mutation.isPending}
          submit={() => mutation.mutate()}
          label="Save budget"
        />
      }
    >
      {query.isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      ) : query.error ? (
        <Err e={query.error} />
      ) : (
        <>
          {/* MAIN PLAN */}

          <section>
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900">Monthly plan</h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Define how much you expect to receive, spend and save this
                month.
              </p>
            </div>

            <div className="grid min-w-0 gap-4 sm:grid-cols-3">
              <Num
                label="Expected income"
                value={value.expectedIncome}
                set={(amount) =>
                  setValue({
                    ...value,
                    expectedIncome: amount,
                  })
                }
              />

              <Num
                label="Spending limit"
                value={value.spendingLimit}
                set={(amount) =>
                  setValue({
                    ...value,
                    spendingLimit: amount,
                  })
                }
              />

              <Num
                label="Savings goal"
                value={value.savingsGoal}
                set={(amount) =>
                  setValue({
                    ...value,
                    savingsGoal: amount,
                  })
                }
              />
            </div>
          </section>

          {/* CATEGORY ALLOCATIONS */}

          <section className="mt-7 border-t border-slate-100 pt-6">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Category allocations
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Optional limits can help you control how much goes into each
                spending category.
              </p>
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              {expenseCategories.map((item) => {
                const allocations = value.categoryAllocations ?? [];

                const amount =
                  allocations.find((allocation) => allocation.category === item)
                    ?.amount ?? 0;

                return (
                  <Num
                    key={item}
                    label={labels[item]}
                    value={amount}
                    set={(nextAmount) =>
                      setValue({
                        ...value,

                        categoryAllocations: [
                          ...allocations.filter(
                            (allocation) => allocation.category !== item,
                          ),

                          ...(nextAmount > 0
                            ? [
                                {
                                  category: item,

                                  amount: nextAmount,
                                },
                              ]
                            : []),
                        ],
                      })
                    }
                  />
                );
              })}
            </div>
          </section>

          {/* NOTES */}

          <section className="mt-7 border-t border-slate-100 pt-6">
            <label className="block min-w-0 text-xs font-semibold text-slate-600">
              Notes
              <textarea
                value={value.notes ?? ""}
                onChange={(event) =>
                  setValue({
                    ...value,

                    notes: event.target.value,
                  })
                }
                rows={4}
                placeholder="Optional notes for this month's budget..."
                className={`${inputClass} resize-y leading-6`}
              />
            </label>
          </section>
        </>
      )}

      {mutation.error && <Err e={mutation.error} />}
    </Modal>
  );
}

/* =========================================================
   EXPENSE MODAL
   ========================================================= */

function ExpenseModal({
  row,
  close,
  done,
}: {
  row?: Expense;
  close: () => void;
  done: () => void;
}) {
  const [value, setValue] = useState<ExpenseInput>({
    amount: row?.amount ?? 0,

    category: row?.category ?? "food",

    description: row?.description ?? "",

    spentAt: row
      ? new Date(row.spentAt).toISOString().slice(0, 16)
      : new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16),

    paymentMethod: row?.paymentMethod ?? "cash",

    notes: row?.notes ?? "",
  });

  const [validationError, setValidationError] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      row
        ? budgetApi.updateExpense(row._id, {
            ...value,

            description: value.description.trim(),

            spentAt: new Date(value.spentAt).toISOString(),
          })
        : budgetApi.createExpense({
            ...value,

            description: value.description.trim(),

            spentAt: new Date(value.spentAt).toISOString(),
          }),

    onSuccess: done,
  });

  const submit = () => {
    setValidationError("");

    if (!Number.isFinite(value.amount) || value.amount <= 0) {
      setValidationError("Enter an expense amount greater than zero.");

      return;
    }

    if (!value.description.trim()) {
      setValidationError("Enter a description for this expense.");

      return;
    }

    if (!value.spentAt || Number.isNaN(new Date(value.spentAt).getTime())) {
      setValidationError("Select a valid date and time.");

      return;
    }

    mutation.mutate();
  };

  return (
    <Modal
      title={row ? "Edit expense" : "Add expense"}
      subtitle={
        row
          ? "Update the details of this expense."
          : "Record a new expense in your private monthly budget."
      }
      close={close}
      preventClose={mutation.isPending}
      size="md"
      footer={
        <Actions
          close={close}
          pending={mutation.isPending}
          submit={submit}
          label={row ? "Save changes" : "Record expense"}
        />
      }
    >
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <Num
          label="Amount (₦)"
          value={value.amount}
          set={(amount) =>
            setValue({
              ...value,
              amount,
            })
          }
        />

        <label className="block min-w-0 text-xs font-semibold text-slate-600">
          Category
          <select
            value={value.category}
            onChange={(event) =>
              setValue({
                ...value,

                category: event.target.value as ExpenseCategory,
              })
            }
            className={inputClass}
          >
            {expenseCategories.map((item) => (
              <option key={item} value={item}>
                {labels[item]}
              </option>
            ))}
          </select>
        </label>

        <label className="block min-w-0 text-xs font-semibold text-slate-600">
          Description
          <input
            value={value.description}
            onChange={(event) =>
              setValue({
                ...value,

                description: event.target.value,
              })
            }
            placeholder="e.g. Lunch, transport, printing"
            className={inputClass}
          />
        </label>

        <label className="block min-w-0 text-xs font-semibold text-slate-600">
          Date & time
          <input
            type="datetime-local"
            value={value.spentAt}
            onChange={(event) =>
              setValue({
                ...value,

                spentAt: event.target.value,
              })
            }
            className={inputClass}
          />
        </label>

        <label className="block min-w-0 text-xs font-semibold text-slate-600 sm:col-span-2">
          Payment method
          <select
            value={value.paymentMethod}
            onChange={(event) =>
              setValue({
                ...value,

                paymentMethod: event.target.value as PaymentMethod,
              })
            }
            className={inputClass}
          >
            <option value="cash">Cash</option>

            <option value="bank_transfer">Bank transfer</option>

            <option value="card">Card</option>

            <option value="mobile_money">Mobile money</option>

            <option value="other">Other</option>
          </select>
        </label>

        <label className="block min-w-0 text-xs font-semibold text-slate-600 sm:col-span-2">
          Notes
          <textarea
            value={value.notes ?? ""}
            onChange={(event) =>
              setValue({
                ...value,

                notes: event.target.value,
              })
            }
            rows={4}
            placeholder="Optional additional information..."
            className={`${inputClass} resize-y leading-6`}
          />
        </label>
      </div>

      {validationError && (
        <p className="mt-5 min-w-0 break-words rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-800">
          {validationError}
        </p>
      )}

      {mutation.error && <Err e={mutation.error} />}
    </Modal>
  );
}

/* =========================================================
   GENERIC PORTAL MODAL
   ========================================================= */

function Modal({
  title,
  subtitle,
  close,
  children,
  footer,
  preventClose = false,
  size = "lg",
}: {
  title: string;
  subtitle?: string;
  close: () => void;
  children: ReactNode;
  footer?: ReactNode;
  preventClose?: boolean;
  size?: "md" | "lg";
}) {
  useModalLock(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !preventClose) {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, preventClose]);

  const maxWidth = size === "md" ? "max-w-xl" : "max-w-3xl";

  const modal = (
    <div
      className="
        fixed left-0 top-0 z-[9999]
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
      aria-labelledby="budget-dialog-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !preventClose) {
          close();
        }
      }}
    >
      <div
        className={`
          relative
          flex
          h-[calc(100dvh-1.5rem)]
          w-full
          min-w-0
          ${maxWidth}
          flex-col
          overflow-hidden
          rounded-2xl
          border border-slate-200
          bg-white
          shadow-[0_25px_80px_rgba(15,23,42,0.4)]
          sm:h-auto
          sm:max-h-[calc(100dvh-2.5rem)]
          sm:rounded-3xl
        `}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* HEADER */}

        <header className="relative shrink-0 border-b border-slate-100 bg-white px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0 pr-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
              Student budget
            </p>

            <h2
              id="budget-dialog-title"
              className="mt-1 break-words text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
            >
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1.5 max-w-2xl break-words text-xs leading-5 text-slate-500 sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={close}
            disabled={preventClose}
            aria-label="Close dialog"
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
          <div className="w-full min-w-0 p-5 sm:p-6">{children}</div>
        </div>

        {/* FOOTER */}

        {footer && (
          <footer className="shrink-0 border-t border-slate-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

/* =========================================================
   NUMBER INPUT
   ========================================================= */

function Num({
  label,
  value,
  set,
}: {
  label: string;
  value: number;
  set: (amount: number) => void;
}) {
  return (
    <label className="block min-w-0 text-xs font-semibold text-slate-600">
      {label}

      <input
        type="number"
        min="0"
        step="100"
        value={value}
        onChange={(event) => {
          const amount = Number(event.target.value);

          set(Number.isFinite(amount) ? Math.max(0, amount) : 0);
        }}
        className={inputClass}
      />
    </label>
  );
}

/* =========================================================
   MODAL ACTIONS
   ========================================================= */

function Actions({
  close,
  pending,
  submit,
  label,
}: {
  close: () => void;
  pending: boolean;
  submit: () => void;
  label: string;
}) {
  return (
    <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end">
      <button
        type="button"
        onClick={close}
        disabled={pending}
        className="
          inline-flex h-11 min-w-0
          items-center justify-center
          rounded-xl
          border border-slate-200
          bg-white
          px-5
          text-sm font-semibold
          text-slate-700
          transition
          hover:bg-slate-50
          disabled:cursor-not-allowed
          disabled:opacity-50
          sm:min-w-[110px]
        "
      >
        Cancel
      </button>

      <button
        type="button"
        disabled={pending}
        onClick={submit}
        className="
          inline-flex h-11 min-w-0
          items-center justify-center
          rounded-xl
          bg-blue-700
          px-5
          text-center
          text-sm font-semibold
          text-white
          transition
          hover:bg-blue-800
          disabled:cursor-not-allowed
          disabled:opacity-50
          sm:min-w-[145px]
        "
      >
        {pending ? "Saving..." : label}
      </button>
    </div>
  );
}

/* =========================================================
   DELETE EXPENSE DIALOG
   ========================================================= */

function DeleteExpenseDialog({
  expense,
  pending,
  error,
  close,
  confirm,
}: {
  expense: Expense;
  pending: boolean;
  error: string | null;
  close: () => void;
  confirm: () => void;
}) {
  useModalLock(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pending, close]);

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
      aria-labelledby="delete-expense-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) {
          close();
        }
      }}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.42)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          disabled={pending}
          aria-label="Close delete confirmation"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5 pr-14 sm:p-6 sm:pr-16">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
            <Trash2 className="h-5 w-5" />
          </div>

          <h2
            id="delete-expense-title"
            className="mt-4 text-xl font-semibold tracking-tight text-slate-950"
          >
            Delete expense?
          </h2>

          <p className="mt-2 break-words text-sm leading-6 text-slate-500">
            You&apos;re about to delete{" "}
            <strong className="font-semibold text-slate-800">
              {expense.description}
            </strong>{" "}
            for{" "}
            <strong className="font-semibold text-slate-800">
              {money(expense.amount)}
            </strong>
            .
          </p>

          <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-semibold leading-5 text-red-700">
            This will permanently remove the expense from your monthly records
            and update your totals and charts.
          </p>

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold leading-5 text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={close}
            disabled={pending}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Keep expense
          </button>

          <button
            type="button"
            onClick={confirm}
            disabled={pending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

/* =========================================================
   ERROR
   ========================================================= */

function Err({ e }: { e: unknown }) {
  return (
    <p className="mt-5 min-w-0 break-words rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-semibold leading-6 text-red-700">
      {readError(e)}
    </p>
  );
}
