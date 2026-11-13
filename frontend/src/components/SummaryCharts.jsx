import { format, parseISO } from "date-fns";
import {
  Bar,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPaise } from "../lib/utils";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-card dark:border-zinc-700 dark:bg-zinc-900">
      <p className="mb-1 font-bold text-slate-900 dark:text-white">
        {payload[0].payload.name ||
          (label ? format(parseISO(`${label}-01`), "MMMM yyyy") : "")}
      </p>
      {payload.map((item) => (
        <p key={item.name} className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <span className="text-slate-500 dark:text-zinc-400">{item.name}</span>
          <span className="ml-auto font-semibold text-slate-900 dark:text-white">
            {formatPaise(item.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

function CardHeader({ title, hint }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
        {title}
      </h3>
      {hint && (
        <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">
          {hint}
        </span>
      )}
    </div>
  );
}

export default function SummaryCharts({ expenseByHead, monthlyTrend }) {
  const totalExpense = expenseByHead.reduce((sum, item) => sum + item.total, 0);
  const topCategories = expenseByHead.slice(0, 6);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <section className="card card-body">
        <CardHeader title="Spending by category" hint="This period" />
        {expenseByHead.length === 0 ? (
          <p className="py-14 text-center text-sm text-slate-500 dark:text-zinc-400">
            No spending recorded for this period.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topCategories}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={78}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {topCategories.map((entry, index) => (
                      <Cell key={index} fill={entry.color || "#6366f1"} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Total
                </span>
                <span className="money text-sm font-bold text-slate-900 dark:text-white">
                  {formatPaise(totalExpense)}
                </span>
              </div>
            </div>

            <ul className="w-full min-w-0 space-y-1.5">
              {topCategories.map((category) => {
                const share = totalExpense
                  ? Math.round((category.total / totalExpense) * 100)
                  : 0;
                return (
                  <li
                    key={category.name}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: category.color || "#6366f1" }}
                      aria-hidden="true"
                    />
                    <span className="truncate font-medium text-slate-700 dark:text-zinc-200">
                      {category.name}
                    </span>
                    <span className="ml-auto shrink-0 text-slate-400 dark:text-zinc-500">
                      {share}%
                    </span>
                    <span className="money w-20 shrink-0 text-right font-semibold text-slate-900 dark:text-white">
                      {formatPaise(category.total)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      <section className="card card-body">
        <CardHeader title="Income vs spending" hint="Last 6 months" />
        {monthlyTrend.every((month) => !month.income && !month.expense) ? (
          <p className="py-14 text-center text-sm text-slate-500 dark:text-zinc-400">
            Not enough history yet — add a few months of entries.
          </p>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Spent
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-3 rounded-full bg-indigo-500" />
                Net
              </span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyTrend}
                  margin={{ top: 4, right: 4, bottom: 0, left: -18 }}
                >
                  <XAxis
                    dataKey="month"
                    tickFormatter={(value) => {
                      try {
                        return format(parseISO(`${value}-01`), "MMM");
                      } catch {
                        return value;
                      }
                    }}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    dy={6}
                  />
                  <YAxis
                    hide
                    domain={[
                      (min) => Math.min(min, 0),
                      (max) => Math.max(max, 0),
                    ]}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
                  />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={22}
                  />
                  <Bar
                    dataKey="expense"
                    name="Spent"
                    fill="#f43f5e"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={22}
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    name="Net"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 0, fill: "#6366f1" }}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
