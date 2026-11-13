import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRightLeft,
  Banknote,
  Building2,
  Smartphone,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import API from "../lib/api";
import { todayYMD, cn } from "../lib/utils";
import { useAccounts, useInvalidateData } from "../hooks/useData";
import { useApp } from "../context/AppContext";
import Sheet from "./ui/Sheet";
import Segmented from "./ui/Segmented";

const MODE_OPTIONS = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "online", label: "Online", icon: Smartphone },
];

export default function TransferModal({ isOpen, onClose, editEntry = null }) {
  const { selectedAccount } = useApp();
  const { data: accounts = [] } = useAccounts();
  const invalidateData = useInvalidateData();

  const [type, setType] = useState("self");
  const [toAccount, setToAccount] = useState("");
  const [fromMode, setFromMode] = useState("cash");
  const [toMode, setToMode] = useState("online");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayYMD());
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const otherAccounts = useMemo(
    () => accounts.filter((account) => account._id !== selectedAccount?._id),
    [accounts, selectedAccount],
  );

  useEffect(() => {
    if (!isOpen || !selectedAccount?._id) return;
    if (editEntry) {
      const counterAccId =
        editEntry.transferToAccount?._id || editEntry.transferToAccount;
      const isSelf = String(counterAccId) === String(selectedAccount._id);

      setType(isSelf ? "self" : "account");
      if (!isSelf) setToAccount(counterAccId);

      if (editEntry.isOutgoing) {
        setFromMode(editEntry.mode || "cash");
        setToMode(editEntry.transferToMode || "online");
      } else {
        setFromMode(editEntry.transferToMode || "cash");
        setToMode(editEntry.mode || "online");
      }

      const rawAmount =
        editEntry.amountPaise !== undefined
          ? editEntry.amountPaise / 100
          : editEntry.amount || "";
      setAmount(String(rawAmount));
      setDate(editEntry.date || todayYMD());
      setSummary(editEntry.summary || "");
    } else {
      setAmount("");
      setSummary("");
      setDate(todayYMD());
      setFromMode("cash");
      setToMode("online");
      setType("self");
      setToAccount(otherAccounts[0]?._id || "");
    }
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editEntry, selectedAccount]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const parsed = parseFloat(amount);
    if (!amount || Number.isNaN(parsed) || parsed <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (type === "self" && fromMode === toMode) {
      setError("Pick two different modes for a self transfer.");
      return;
    }
    if (type === "account" && !toAccount) {
      setError("Choose the account receiving the money.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = {
        fromAccount: selectedAccount._id,
        fromMode,
        toAccount: type === "self" ? selectedAccount._id : toAccount,
        toMode,
        amount: parsed,
        date,
        summary,
      };

      if (editEntry) {
        // Updates both legs atomically — never deletes data before saving.
        await API.put(`/entries/transfer/${editEntry._id}`, payload);
      } else {
        await API.post("/entries/transfer", payload);
      }

      toast.success(editEntry ? "Transfer updated" : "Transfer saved");
      invalidateData();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const destinationName =
    type === "self"
      ? selectedAccount?.name
      : accounts.find((account) => account._id === toAccount)?.name || "Account";

  const modeName = (mode) => (mode === "cash" ? "Cash" : "Online");

  return (
    <Sheet
      open={isOpen}
      onClose={onClose}
      title={editEntry ? "Edit transfer" : "Transfer money"}
      description="Move money between cash and online, or between accounts."
      footer={
        <div className="space-y-2">
          {error && (
            <p
              role="alert"
              className="text-xs font-semibold text-rose-600 dark:text-rose-400"
            >
              {error}
            </p>
          )}
          <button
            form="transfer-form"
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? "Saving…" : editEntry ? "Update transfer" : "Save transfer"}
          </button>
        </div>
      }
    >
      <form id="transfer-form" onSubmit={handleSubmit} className="space-y-5 pb-1">
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-zinc-800/80">
          <button
            type="button"
            onClick={() => setType("self")}
            aria-pressed={type === "self"}
            className="seg-item"
          >
            <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
            Between modes
          </button>
          <button
            type="button"
            onClick={() => setType("account")}
            aria-pressed={type === "account"}
            disabled={otherAccounts.length === 0}
            className="seg-item disabled:cursor-not-allowed disabled:opacity-40"
            title={
              otherAccounts.length === 0
                ? "Add another account to transfer between accounts"
                : undefined
            }
          >
            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
            To account
          </button>
        </div>

        <div>
          <label htmlFor="transfer-amount" className="label">
            Amount (₹)
          </label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-indigo-600 dark:text-indigo-400"
            >
              ₹
            </span>
            <input
              id="transfer-amount"
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
        </div>

        {type === "account" && (
          <div>
            <label htmlFor="transfer-account" className="label">
              Destination account
            </label>
            <select
              id="transfer-account"
              className="input"
              value={toAccount}
              onChange={(event) => setToAccount(event.target.value)}
            >
              {otherAccounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/30">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              From · {selectedAccount?.name}
            </p>
            <Segmented
              ariaLabel="Source payment mode"
              value={fromMode}
              onChange={(value) => {
                setFromMode(value);
                setError("");
              }}
              options={MODE_OPTIONS}
            />
          </div>

          <div className="my-3 flex justify-center">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500">
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              To · {destinationName}
            </p>
            <Segmented
              ariaLabel="Destination payment mode"
              value={toMode}
              onChange={(value) => {
                setToMode(value);
                setError("");
              }}
              options={MODE_OPTIONS}
            />
          </div>
        </div>

        <div className="rounded-xl bg-indigo-50/70 px-3 py-2 text-[11px] font-medium leading-5 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-200">
          <ArrowRightLeft className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
          {modeName(fromMode)} → {modeName(toMode)} · this creates two linked
          entries so your balances stay accurate.
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="transfer-date" className="label">
              Date
            </label>
            <input
              type="date"
              id="transfer-date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label htmlFor="transfer-note" className="label">
              Note
            </label>
            <input
              type="text"
              id="transfer-note"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Optional"
              className="input"
              maxLength={200}
            />
          </div>
        </div>
      </form>
    </Sheet>
  );
}
