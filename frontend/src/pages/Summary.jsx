import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, addMonths, isSameMonth } from "date-fns";
import {
  ArrowRight,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  HandCoins,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import API from "../lib/api";
import { formatPaise, cn } from "../lib/utils";
import { useApp } from "../context/AppContext";
import DeferredSummaryCharts from "../components/DeferredSummaryCharts";
import EntryRow from "../components/EntryRow";
import EmptyState from "../components/ui/EmptyState";
import { SummarySkeleton } from "../components/ui/Skeleton";
import { openAddEntry, openTransfer } from "../lib/quickActions";

function Delta({ current, previous, goodWhenUp }) {
  if (!previous) return null;
  const percent = Math.round(((current - previous) / previous) * 100);
  if (!Number.isFinite(percent) || percent === 0) {
    return (
      <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
        Same as last month
      </span>
    );
  }
  const isUp = percent > 0;
  const isGood = goodWhenUp ? isUp : !isUp;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-semibold",
        isGood
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-rose-600 dark:text-rose-400",
      )}
    >
      {isUp ? (
        <TrendingUp className="h-3 w-3" aria-hidden="true" />
      ) : (
        <TrendingDown className="h-3 w-3" aria-hidden="true" />
      )}
      {Math.abs(percent)}%
      <span className="font-normal text-slate-400 dark:text-zinc-500">
        vs last month
      </span>
    </span>
  );
}

export default function Summary() {
  const { selectedAccount } = useApp();
  const [date, setDate] = useState(new Date());
  const [isAllTime, setIsAllTime] = useState(false);

  const handlePrev = () => {
    setIsAllTime(false);
    setDate((value) => subMonths(value, 1));
  };
  const handleNext = () => {
    setIsAllTime(false);
    setDate((value) => addMonths(value, 1));
  };

  const queryMonth = isAllTime ? "all" : date.getMonth() + 1;
  const queryYear = isAllTime ? "all" : date.getFullYear();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["summary", selectedAccount?._id, queryMonth, queryYear],
    queryFn: () =>
      API.get(
        `/summary?account=${selectedAccount._id}&month=${queryMonth}&year=${queryYear}`,
      ),
    enabled: !!selectedAccount?._id,
  });

  const { data: recent, isLoading: recentLoading } = useQuery({
    queryKey: ["entries", selectedAccount?._id, "recent"],
    queryFn: () => API.get(`/entries?account=${selectedAccount._id}&limit=5`),
    enabled: !!selectedAccount?._id,
  });

  if (isLoading) return <SummarySkeleton />;

  if (isError) {
    return (
      <div className="card card-body text-center">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          We couldn’t load your summary
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          {error?.message || "Something went wrong."}
        </p>
        <button
          onClick={() => refetch()}
          className="btn-primary btn-sm mx-auto mt-4"
        >
          Try again
        </button>
      </div>
    );
  }

  const allTime = data?.allTime || {
    cashPaise: 0,
    onlinePaise: 0,
    totalPaise: 0,
  };
  const monthTotals = data?.monthTotals || {
    incomePaise: 0,
    expensePaise: 0,
    netPaise: 0,
  };
  const prevTotals = data?.prevTotals || {
    incomePaise: 0,
    expensePaise: 0,
  };
  const expenseByHead = data?.expenseByHead || [];
  const monthlyTrend = data?.monthlyTrend || [];
  const loans = data?.loans || {
    youWillGetPaise: 0,
    youOwePaise: 0,
    pendingCount: 0,
  };

  const spendingRatio =
    monthTotals.incomePaise > 0
      ? Math.min(
          Math.round((monthTotals.expensePaise / monthTotals.incomePaise) * 100),
          100,
        )
      : 0;
  const periodLabel = isAllTime
    ? "All time"
    : format(date, "MMMM yyyy");
  const recentItems = recent?.items || [];
  const hasAnyData =
    recentItems.length > 0 ||
    allTime.totalPaise !== 0 ||
    monthTotals.incomePaise > 0 ||
    monthTotals.expensePaise > 0;

  return (
    <div className="animate-fade-in space-y-5 pb-4 sm:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-label">Overview</p>
          <h1 className="page-title mt-1">Your money, at a glance</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openAddEntry} className="btn-primary btn-sm">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add entry
          </button>
          <button
            onClick={openTransfer}
            className="btn-secondary btn-sm"
            aria-label="Transfer money"
          >
            <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Transfer</span>
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="card flex items-center gap-2 p-1.5">
        <button
          onClick={handlePrev}
          aria-label="Previous month"
          className="icon-btn"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
            {periodLabel}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            {isAllTime
              ? "Every transaction to date"
              : isFetching
                ? "Refreshing…"
                : "Income, spending and balance"}
          </p>
        </div>
        {!isAllTime && !isSameMonth(date, new Date()) && (
          <button
            onClick={() => setDate(new Date())}
            className="text-[11px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            This month
          </button>
        )}
        <button
          onClick={() => setIsAllTime((value) => !value)}
          aria-pressed={isAllTime}
          className="chip min-h-[32px] py-1 text-[11px]"
        >
          All time
        </button>
        <button
          onClick={handleNext}
          aria-label="Next month"
          disabled={isSameMonth(date, new Date()) && !isAllTime}
          className="icon-btn"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Balance hero */}
      <section
        aria-labelledby="balance-heading"
        className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-5 text-white shadow-xl shadow-indigo-600/20 sm:p-7"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-white/5 blur-2xl"
        />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <p
              id="balance-heading"
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-200"
            >
              Total balance
            </p>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-100 ring-1 ring-inset ring-white/15">
              {selectedAccount?.name}
            </span>
          </div>

          <p className="money mt-2 text-[2.1rem] font-bold leading-none tracking-tight sm:text-5xl">
            {formatPaise(allTime.totalPaise)}
          </p>

          <p className="mt-2 text-xs text-indigo-200">
            {monthTotals.netPaise >= 0 ? "Up" : "Down"}{" "}
            <span className="font-semibold text-white">
              {formatPaise(Math.abs(monthTotals.netPaise))}
            </span>{" "}
            {isAllTime ? "overall" : `in ${format(date, "MMMM")}`}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-inset ring-white/15 backdrop-blur-sm sm:p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-100">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                Cash
              </p>
              <p className="money mt-1 text-lg font-bold sm:text-2xl">
                {formatPaise(allTime.cashPaise)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-inset ring-white/15 backdrop-blur-sm sm:p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-100">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
                Online
              </p>
              <p className="money mt-1 text-lg font-bold sm:text-2xl">
                {formatPaise(allTime.onlinePaise)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {!hasAnyData ? (
        <div className="card">
          <EmptyState
            icon={Receipt}
            title="No entries yet"
            description="Add your first income or expense to see balances, trends and category breakdowns here."
            action={
              <button onClick={openAddEntry} className="btn-primary">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add your first entry
              </button>
            }
          />
        </div>
      ) : (
        <>
          {/* Month stats */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <div className="card card-body">
              <p className="section-label flex items-center gap-1.5">
                <TrendingUp
                  className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
                Income
              </p>
              <p className="money mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400 sm:text-2xl">
                {formatPaise(monthTotals.incomePaise)}
              </p>
              <div className="mt-1.5">
                {!isAllTime && (
                  <Delta
                    current={monthTotals.incomePaise}
                    previous={prevTotals.incomePaise}
                    goodWhenUp
                  />
                )}
              </div>
            </div>

            <div className="card card-body">
              <p className="section-label flex items-center gap-1.5">
                <TrendingDown
                  className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400"
                  aria-hidden="true"
                />
                Spent
              </p>
              <p className="money mt-2 text-xl font-bold text-rose-600 dark:text-rose-400 sm:text-2xl">
                {formatPaise(monthTotals.expensePaise)}
              </p>
              <div className="mt-1.5">
                {!isAllTime && (
                  <Delta
                    current={monthTotals.expensePaise}
                    previous={prevTotals.expensePaise}
                    goodWhenUp={false}
                  />
                )}
              </div>
            </div>

            <div className="card card-body col-span-2 lg:col-span-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="section-label">Net saved</p>
                  <p
                    className={cn(
                      "money mt-2 text-xl font-bold sm:text-2xl",
                      monthTotals.netPaise >= 0
                        ? "text-slate-900 dark:text-white"
                        : "text-rose-600 dark:text-rose-400",
                    )}
                  >
                    {formatPaise(monthTotals.netPaise)}
                  </p>
                </div>
                <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {spendingRatio}% spent
                </span>
              </div>
              <div
                className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
                role="img"
                aria-label={`${spendingRatio} percent of income spent`}
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    spendingRatio > 90
                      ? "bg-rose-500"
                      : spendingRatio > 70
                        ? "bg-amber-400"
                        : "bg-emerald-500",
                  )}
                  style={{ width: `${Math.max(spendingRatio, 3)}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                Income minus spending for {isAllTime ? "all time" : "this month"}
              </p>
            </div>
          </div>

          {/* Recent activity + loans */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            <section className="card overflow-hidden lg:col-span-3">
              <div className="card-head">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Recent activity
                </h2>
                <Link
                  to="/entries"
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
              {recentLoading ? (
                <div className="space-y-2 p-4" aria-hidden="true">
                  {[0, 1, 2].map((row) => (
                    <div key={row} className="flex items-center gap-3">
                      <div className="skeleton h-8 w-8 rounded-xl" />
                      <div className="flex-1 space-y-1.5">
                        <div className="skeleton h-3 w-28" />
                        <div className="skeleton h-2.5 w-16" />
                      </div>
                      <div className="skeleton h-3 w-14" />
                    </div>
                  ))}
                </div>
              ) : recentItems.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-zinc-400">
                  Nothing recorded yet.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {recentItems.map((entry) => (
                    <EntryRow key={entry._id} entry={entry} compact />
                  ))}
                </div>
              )}
            </section>

            <section className="card overflow-hidden lg:col-span-2">
              <div className="card-head">
                <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                  <HandCoins
                    className="h-4 w-4 text-violet-500"
                    aria-hidden="true"
                  />
                  Outside wallet
                </h2>
                <span className="badge bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                  {loans.pendingCount} pending
                </span>
              </div>
              <div className="card-body space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50/60 px-3 py-2.5 dark:bg-emerald-950/20">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      You’ll get back
                    </p>
                    <p className="money mt-0.5 text-lg font-bold text-emerald-700 dark:text-emerald-300">
                      {formatPaise(loans.youWillGetPaise)}
                    </p>
                  </div>
                  <TrendingUp
                    className="h-5 w-5 text-emerald-500"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-rose-50/60 px-3 py-2.5 dark:bg-rose-950/20">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                      You owe
                    </p>
                    <p className="money mt-0.5 text-lg font-bold text-rose-700 dark:text-rose-300">
                      {formatPaise(loans.youOwePaise)}
                    </p>
                  </div>
                  <TrendingDown
                    className="h-5 w-5 text-rose-500"
                    aria-hidden="true"
                  />
                </div>
                <Link
                  to="/loans"
                  className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Manage loans
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <p className="text-center text-[10px] text-slate-400 dark:text-zinc-500">
                  Tracked separately from cash and online balances
                </p>
              </div>
            </section>
          </div>

          <DeferredSummaryCharts
            expenseByHead={expenseByHead}
            monthlyTrend={monthlyTrend}
          />
        </>
      )}
    </div>
  );
}
