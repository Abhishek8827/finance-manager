import { ArrowDownLeft, ArrowUpRight, Pencil, Repeat2, Trash2 } from "lucide-react";
import { formatPaise, cn } from "../lib/utils";

export function entryMeta(entry) {
  const isTransfer = entry.type === "transfer";
  const isLoan = entry.type === "loan";

  const title = isTransfer
    ? `${entry.isOutgoing ? "To" : "From"} ${
        entry.transferToAccount?.name || "own account"
      }`
    : isLoan
      ? entry.summary || (entry.isOutgoing ? "Loan given" : "Loan received")
      : entry.head?.name || "Uncategorized";

  const isIncoming =
    entry.type === "income" ||
    (isTransfer && !entry.isOutgoing) ||
    (isLoan && !entry.isOutgoing);

  return {
    isTransfer,
    isLoan,
    title,
    subtitle: isLoan ? "" : entry.summary || "",
    isIncoming,
  };
}

const TONES = {
  income: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300",
  expense: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300",
  transfer: "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300",
  loan: "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300",
};

export default function EntryRow({
  entry,
  onEdit,
  onDelete,
  showActions = false,
  readOnly = false,
  compact = false,
}) {
  const { isTransfer, isLoan, title, subtitle, isIncoming } = entryMeta(entry);
  const Icon =
    entry.type === "income"
      ? ArrowDownLeft
      : entry.type === "expense"
        ? ArrowUpRight
        : isTransfer
          ? Repeat2
          : ArrowUpRight;

  const amount = `${isIncoming ? "+" : "−"}${formatPaise(entry.amountPaise)}`;

  return (
    <div
      className={cn(
        "group flex items-center gap-3",
        compact ? "px-4 py-2.5" : "px-4 py-3.5",
        "row-hover",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl text-base",
          compact ? "h-8 w-8" : "h-10 w-10",
          TONES[entry.type] || TONES.expense,
        )}
        aria-hidden="true"
      >
        {entry.head?.emoji ? (
          <span className={compact ? "text-sm" : "text-lg"}>
            {entry.head.emoji}
          </span>
        ) : (
          <Icon className={compact ? "h-4 w-4" : "h-[18px] w-[18px]"} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-zinc-100">
            {title}
          </p>
          {isLoan && (
            <span className="badge shrink-0 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
              Loan
            </span>
          )}
          <span
            className={cn(
              "badge shrink-0",
              entry.mode === "cash"
                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                : "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
            )}
          >
            {entry.mode === "cash" ? "Cash" : "Online"}
          </span>
        </div>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <span
          className={cn(
            "money text-sm font-bold",
            isIncoming
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-800 dark:text-zinc-200",
          )}
        >
          {amount}
        </span>

        {showActions && !readOnly && (
          <div className="flex items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <button
              onClick={() => onEdit?.(entry)}
              aria-label={`Edit ${title}`}
              className="icon-btn h-8 w-8"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              onClick={() => onDelete?.(entry)}
              aria-label={`Delete ${title}`}
              className="icon-btn h-8 w-8 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
