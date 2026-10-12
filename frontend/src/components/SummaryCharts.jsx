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
} from "recharts";
import { formatPaise } from "../lib/utils";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

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

export default function SummaryCharts({ expenseByHead, monthlyTrend }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-5">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">
          Expenses by Category
        </h3>
        {expenseByHead.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10 text-sm">
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
          {expenseByHead.map((head, index) => (
            <span
              key={index}
              className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: head.color || "#6366f1" }}
              />{" "}
              {head.name}
            </span>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">
          6-Month Trend
        </h3>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyTrend}>
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
  );
}
