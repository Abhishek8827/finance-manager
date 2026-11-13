import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Check,
  Plus,
  Smartphone,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { toast } from "sonner";
import API from "../lib/api";
import { todayYMD, cn } from "../lib/utils";
import { useHeads, useInvalidateData } from "../hooks/useData";
import { useApp } from "../context/AppContext";
import { useQueryClient } from "@tanstack/react-query";
import Sheet from "./ui/Sheet";
import Segmented from "./ui/Segmented";

const TYPE_OPTIONS = [
  { value: "expense", label: "Expense", icon: TrendingDown },
  { value: "income", label: "Income", icon: TrendingUp },
];

const MODE_OPTIONS = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "online", label: "Online", icon: Smartphone },
];

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

function yesterdayYMD() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function AddEntryModal({ isOpen, onClose, editEntry = null }) {
  const { selectedAccount } = useApp();
  const [type, setType] = useState("expense");
  const [mode, setMode] = useState("cash");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayYMD());
  const [headId, setHeadId] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showNewHead, setShowNewHead] = useState(false);
  const [newHeadName, setNewHeadName] = useState("");

  const { data: heads = [] } = useHeads();
  const invalidateData = useInvalidateData();
  const queryClient = useQueryClient();

  const filteredHeads = useMemo(
    () => heads.filter((head) => head.type === type && !head.archived),
    [heads, type],
  );

  useEffect(() => {
    if (!isOpen) return;
    if (editEntry) {
      setType(editEntry.type || "expense");
      setMode(editEntry.mode || "cash");
      const rawAmount =
        editEntry.amountPaise !== undefined
          ? editEntry.amountPaise / 100
          : editEntry.amount || "";
      setAmount(String(rawAmount));
      setDate(editEntry.date || todayYMD());
      setHeadId(editEntry.head?._id || editEntry.head || "");
      setSummary(editEntry.summary || "");
    } else {
      setAmount("");
      setSummary("");
      setDate(todayYMD());
      setHeadId("");
      setType("expense");
      setMode("cash");
    }
    setError("");
    setShowNewHead(false);
    setNewHeadName("");
  }, [isOpen, editEntry]);

  useEffect(() => {
    if (!headId) return;
    const selected = heads.find((head) => head._id === headId);
    if (selected && selected.type !== type) setHeadId("");
  }, [type, headId, heads]);

  const changeType = (nextType) => {
    setType(nextType);
    setError("");
  };

  const handleCreateHead = async () => {
    if (!newHeadName.trim()) return;
    try {
      const res = await API.post("/heads", {
        account: selectedAccount._id,
        name: newHeadName.trim(),
        type,
      });
      await queryClient.invalidateQueries({
        queryKey: ["heads", selectedAccount._id],
      });
      setHeadId(res._id);
      setShowNewHead(false);
      setNewHeadName("");
      toast.success("Category created");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const parsed = parseFloat(amount);
    if (!amount || Number.isNaN(parsed) || parsed <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!headId) {
      setError("Pick a category for this entry.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = {
        account: selectedAccount._id,
        type,
        mode,
        date,
        amount: parsed,
        head: headId,
        summary,
      };

      if (editEntry) {
        await API.put(`/entries/${editEntry._id}`, payload);
        toast.success("Entry updated");
      } else {
        await API.post("/entries", payload);
        toast.success(
          `${type === "income" ? "Income" : "Expense"} of ₹${parsed.toLocaleString("en-IN")} saved`,
        );
      }

      invalidateData();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const isIncome = type === "income";
  const accent = isIncome
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-rose-600 dark:text-rose-400";

  return (
    <Sheet
      open={isOpen}
      onClose={onClose}
      title={editEntry ? "Edit entry" : "New entry"}
      description={
        selectedAccount?.name
          ? `Recording in ${selectedAccount.name}`
          : undefined
      }
      footer={
        <div className="space-y-2">
          {error && (
            <p role="alert" className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}
          <button
            form="entry-form"
            type="submit"
            disabled={loading}
            className={cn(
              "w-full rounded-xl py-3 text-sm font-bold text-white shadow-sm transition active:scale-[0.99] disabled:opacity-60",
              isIncome
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-rose-600 hover:bg-rose-700",
            )}
          >
            {loading
              ? "Saving…"
              : editEntry
                ? "Update entry"
                : `Save ${isIncome ? "income" : "expense"}`}
          </button>
        </div>
      }
    >
      <form id="entry-form" onSubmit={handleSubmit} className="space-y-5 pb-1">
        <Segmented
          ariaLabel="Entry type"
          value={type}
          onChange={changeType}
          options={TYPE_OPTIONS}
          itemClassName={cn(
            type === "income" && "aria-[pressed=true]:text-emerald-700",
            type === "expense" && "aria-[pressed=true]:text-rose-700",
          )}
        />

        <div>
          <label htmlFor="entry-amount" className="label">
            Amount (₹)
          </label>
          <div className="relative">
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold",
                accent,
              )}
            >
              ₹
            </span>
            <input
              id="entry-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setError("");
              }}
              className={cn(
                "money h-16 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-3xl font-bold text-slate-900 outline-none transition",
                "placeholder:text-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20",
                "dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-white dark:placeholder:text-zinc-600 dark:focus:bg-zinc-800",
              )}
              placeholder="0"
              autoFocus
            />
          </div>
          {!editEntry && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_AMOUNTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setAmount(
                      String(
                        Number((parseFloat(amount || 0) + value).toFixed(2)),
                      ),
                    )
                  }
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  +₹{value.toLocaleString("en-IN")}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount("")}
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-500 transition hover:text-rose-600 dark:text-zinc-400"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="label mb-0">Category</span>
            {!showNewHead && (
              <button
                type="button"
                onClick={() => setShowNewHead(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                New
              </button>
            )}
          </div>

          {showNewHead ? (
            <div className="flex gap-2">
              <input
                type="text"
                aria-label="New category name"
                value={newHeadName}
                onChange={(event) => setNewHeadName(event.target.value)}
                placeholder="e.g. Groceries"
                className="input flex-1"
                autoFocus
                maxLength={40}
              />
              <button
                type="button"
                onClick={handleCreateHead}
                className="btn-primary btn-sm px-3"
                aria-label="Create category"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setShowNewHead(false)}
                aria-label="Cancel new category"
                className="btn-secondary btn-sm px-3"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : filteredHeads.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 p-3 text-xs text-slate-500 dark:border-zinc-700 dark:text-zinc-400">
              <Tag className="h-4 w-4" aria-hidden="true" />
              No {type} categories yet — create your first one.
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category">
              {filteredHeads.map((head) => {
                const isActive = headId === head._id;
                return (
                  <button
                    key={head._id}
                    type="button"
                    onClick={() => {
                      setHeadId(head._id);
                      setError("");
                    }}
                    aria-pressed={isActive}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition",
                      isActive
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
                    )}
                  >
                    {head.emoji ? (
                      <span aria-hidden="true">{head.emoji}</span>
                    ) : (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "h-2 w-2 rounded-full",
                          isActive && "bg-white/90",
                        )}
                        style={
                          isActive ? undefined : { backgroundColor: head.color }
                        }
                      />
                    )}
                    {head.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="label">Payment mode</span>
            <Segmented
              ariaLabel="Payment mode"
              value={mode}
              onChange={setMode}
              options={MODE_OPTIONS}
            />
          </div>
          <div>
            <label htmlFor="entry-date" className="label">
              Date
            </label>
            <input
              type="date"
              id="entry-date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="input"
              required
            />
          </div>
        </div>

        <div className="flex gap-1.5">
          {[
            { label: "Today", value: todayYMD() },
            { label: "Yesterday", value: yesterdayYMD() },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setDate(option.value)}
              aria-pressed={date === option.value}
              className="chip min-h-[30px] py-1 text-[11px]"
            >
              {option.label}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="entry-note" className="label">
            Note <span className="font-normal normal-case tracking-normal text-slate-400">(optional)</span>
          </label>
          <input
            type="text"
            id="entry-note"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="What was this for?"
            className="input"
            maxLength={200}
          />
        </div>

        {editEntry && (
          <p className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-zinc-500">
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            To remove this entry, use the delete action in Activity.
          </p>
        )}
      </form>
    </Sheet>
  );
}
