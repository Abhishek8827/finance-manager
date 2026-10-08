import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import API from "../lib/api";
import { todayYMD } from "../lib/utils";
import { useAccounts, useInvalidateData } from "../hooks/useData";
import { useApp } from "../context/AppContext";

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

  useEffect(() => {
    if (isOpen && selectedAccount?._id) {
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

        const rawAmt =
          editEntry.amountPaise !== undefined
            ? editEntry.amountPaise / 100
            : editEntry.amount || "";
        setAmount(String(rawAmt));
        setDate(editEntry.date || todayYMD());
        setSummary(editEntry.summary || "");
      } else {
        setAmount("");
        setSummary("");
        setDate(todayYMD());
        setFromMode("cash");
        setToMode("online");
        setType("self");
        const otherAcc = accounts.find((a) => a._id !== selectedAccount._id);
        if (otherAcc) setToAccount(otherAcc._id);
      }
    }
  }, [isOpen, accounts, selectedAccount, editEntry]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0)
      return toast.error("Enter a valid amount");
    if (type === "self" && fromMode === toMode)
      return toast.error("Select different modes for self transfer");

    setLoading(true);
    try {
      if (editEntry) {
        // If editing a transfer, delete old transfer legs and recreate
        await API.delete(`/entries/${editEntry._id}`);
      }

      await API.post("/entries/transfer", {
        fromAccount: selectedAccount._id,
        fromMode,
        toAccount: type === "self" ? selectedAccount._id : toAccount,
        toMode,
        amount: parseFloat(amount),
        date,
        summary,
      });

      toast.success(editEntry ? "Transfer updated!" : "Transfer successful");
      invalidateData();
      onClose();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="relative bg-white dark:bg-zinc-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType("self")}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                type === "self"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 dark:text-zinc-400"
              }`}
            >
              Self Transfer
            </button>
            <button
              type="button"
              onClick={() => setType("account")}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                type === "account"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 dark:text-zinc-400"
              }`}
            >
              To Account
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <form
            id="transfer-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="text-center">
              <span className="text-gray-400 text-2xl absolute mt-3 ml-4">
                ₹
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-5xl font-bold text-center py-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-white"
                placeholder="0"
                autoFocus
                required
              />
            </div>

            <div className="bg-gray-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-4 relative">
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                  From ({selectedAccount?.name})
                </p>
                <div className="flex bg-white dark:bg-zinc-800 p-1 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setFromMode("cash")}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                      fromMode === "cash"
                        ? "bg-amber-400 text-white shadow"
                        : "text-gray-500 dark:text-zinc-400"
                    }`}
                  >
                    CASH
                  </button>
                  <button
                    type="button"
                    onClick={() => setFromMode("online")}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                      fromMode === "online"
                        ? "bg-blue-500 text-white shadow"
                        : "text-gray-500 dark:text-zinc-400"
                    }`}
                  >
                    ONLINE
                  </button>
                </div>
              </div>

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full flex items-center justify-center shadow-sm z-10">
                <ArrowDown className="w-4 h-4 text-gray-400" />
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                  To {type === "self" ? selectedAccount?.name : "Account"}
                </p>
                {type === "account" && (
                  <select
                    value={toAccount}
                    onChange={(e) => setToAccount(e.target.value)}
                    className="input mb-2"
                  >
                    {accounts
                      .filter((a) => a._id !== selectedAccount?._id)
                      .map((a) => (
                        <option key={a._id} value={a._id}>
                          {a.name}
                        </option>
                      ))}
                  </select>
                )}
                <div className="flex bg-white dark:bg-zinc-800 p-1 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setToMode("cash")}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                      toMode === "cash"
                        ? "bg-amber-400 text-white shadow"
                        : "text-gray-500 dark:text-zinc-400"
                    }`}
                  >
                    CASH
                  </button>
                  <button
                    type="button"
                    onClick={() => setToMode("online")}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                      toMode === "online"
                        ? "bg-blue-500 text-white shadow"
                        : "text-gray-500 dark:text-zinc-400"
                    }`}
                  >
                    ONLINE
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2 block">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2 block">
                  Note
                </label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Optional"
                  className="input w-full"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50 rounded-b-3xl">
          <button
            form="transfer-form"
            type="submit"
            disabled={loading}
            className="w-full btn bg-blue-600 hover:bg-blue-700 text-white py-3.5 text-base shadow-lg shadow-blue-200 dark:shadow-none"
          >
            {loading
              ? "Processing..."
              : editEntry
                ? "Update Transfer"
                : "Complete Transfer"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
