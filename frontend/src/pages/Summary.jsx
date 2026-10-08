import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, addMonths, isSameMonth, parseISO } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
} from "recharts";
import API from "../lib/api";
import { formatPaise, cn } from "../lib/utils";
import { useApp } from "../context/AppContext";

export default function Summary() {
  const { selectedAccount } = useApp();
  const [date, setDate] = useState(new Date());
  const [isAllTime, setIsAllTime] = useState(false);

  const handlePrev = () => {
    setIsAllTime(false);
    setDate((d) => subMonths(d, 1));
  };
  const handleNext = () => {
    setIsAllTime(false);
    setDate((d) => addMonths(d, 1));
  };
  const handleAllTime = () => setIsAllTime(true);

  const queryMonth = isAllTime ? "all" : date.getMonth() + 1;
  const queryYear = isAllTime ? "all" : date.getFullYear();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["summary", selectedAccount?._id, queryMonth, queryYear],
    queryFn: () =>
      API.get(
        `/summary?account=${selectedAccount._id}&month=${queryMonth}&year=${queryYear}`,
      ),
    enabled: !!selectedAccount?._id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card p-6 text-center text-red-600">
        Failed to load summary: {error?.message || "Unknown error"}
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
  const prevTotals = data?.prevTotals || { incomePaise: 0, expensePaise: 0 };
  const incomeByHead = data?.incomeByHead || [];
  const expenseByHead = data?.expenseByHead || [];
  const monthlyTrend = data?.monthlyTrend || [];
  const loans = data?.loans || {
    youWillGetPaise: 0,
    youOwePaise: 0,
    pendingCount: 0,
  };

  const incDiff = monthTotals.incomePaise - prevTotals.incomePaise;
  const expDiff = monthTotals.expensePaise - prevTotals.expensePaise;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-900 p-3 rounded-xl shadow-lg border border-gray-100 dark:border-neutral-800 text-sm">
          <p className="font-bold text-gray-800 dark:text-gray-100">
            {payload[0].payload.name || payload[0].payload.month}
          </p>
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{ color: entry.color }}
              className="font-semibold"
            >
              {entry.name}: {formatPaise(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* HEADER: Stepper */}
      <div className="card flex items-center justify-between p-2">
        <button
          onClick={handlePrev}
          className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800 dark:text-gray-100">
            {isAllTime ? "All Time" : format(date, "MMMM yyyy")}
          </span>
          {!isAllTime && (
            <button
              onClick={handleAllTime}
              className="text-[10px] bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded-md font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
            >
              ALL TIME
            </button>
          )}
        </div>
        <button
          onClick={handleNext}
          disabled={isSameMonth(date, new Date()) && !isAllTime}
          className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* HERO: All Time Balance */}
      <div className="card p-5 sm:p-6 bg-gradient-to-br from-indigo-900 to-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none border-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Wallet className="w-40 h-40 transform translate-x-4 -translate-y-4" />
        </div>

        <div className="relative z-10">
          <p className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-1">
            Total Balance
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight">
            {formatPaise(allTime.totalPaise)}
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/20 shadow-sm">
              <p className="text-xs text-indigo-200 uppercase font-bold tracking-widest mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Cash
              </p>
              <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {formatPaise(allTime.cashPaise)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/20 shadow-sm">
              <p className="text-xs text-indigo-200 uppercase font-bold tracking-widest mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" /> Online
              </p>
              <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {formatPaise(allTime.onlinePaise)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STAT CARDS (4 Columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income */}
        <div className="card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Income
            </p>
            {!isAllTime && (
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5",
                  incDiff >= 0
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
                )}
              >
                {incDiff >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {formatPaise(Math.abs(incDiff))}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-500 mt-auto">
            {formatPaise(monthTotals.incomePaise)}
          </h3>
        </div>

        {/* Expense */}
        <div className="card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Expense
            </p>
            {!isAllTime && (
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5",
                  expDiff <= 0
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
                )}
              >
                {expDiff <= 0 ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <TrendingUp className="w-3 h-3" />
                )}
                {formatPaise(Math.abs(expDiff))}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-red-600 dark:text-red-500 mt-auto">
            {formatPaise(monthTotals.expensePaise)}
          </h3>
        </div>

        {/* Settlements */}
        <div className="card p-4 flex flex-col justify-between">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Settlements
          </p>
          <div className="flex justify-between items-end mt-auto">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">
                Get
              </p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-500">
                {formatPaise(loans.youWillGetPaise)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase">
                Owe
              </p>
              <p className="text-base font-bold text-red-600 dark:text-red-500">
                {formatPaise(loans.youOwePaise)}
              </p>
            </div>
          </div>
        </div>
        {/* Net Savings */}
        <div className="card p-4 bg-gray-50 dark:bg-neutral-800/50 flex flex-col justify-between">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Net Balance
          </p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-auto">
            {formatPaise(monthTotals.netPaise)}
          </h3>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EXPENSE DONUT */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">
            Expenses by Category
          </h3>
          {expenseByHead.length === 0 ? (
            <p className="text-center text-gray-400 dark:text-gray-500 py-10 text-sm">
              No expenses recorded
            </p>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByHead}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {expenseByHead.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || "#6366f1"}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {expenseByHead.map((h, i) => (
              <span
                key={i}
                className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: h.color || "#6366f1" }}
                />{" "}
                {h.name}
              </span>
            ))}
          </div>
        </div>

        {/* 6-MONTH TREND */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">
            6-Month Trend
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrend}>
                <XAxis
                  dataKey="month"
                  tickFormatter={(val) => {
                    try {
                      return format(parseISO(`${val}-01`), "MMM");
                    } catch {
                      return val;
                    }
                  }}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  name="Net"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
