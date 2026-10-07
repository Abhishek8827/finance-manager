import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import API from "../lib/api";
import { todayYMD } from "../lib/utils";
import { useHeads, useInvalidateData } from "../hooks/useData";
import { useApp } from "../context/AppContext";
import { useQueryClient } from "@tanstack/react-query";

export default function AddEntryModal({ isOpen, onClose }) {
  const { selectedAccount } = useApp();
  const [type, setType] = useState("expense");
  const [mode, setMode] = useState("cash");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayYMD());
  const [headId, setHeadId] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const [showNewHead, setShowNewHead] = useState(false);
  const [newHeadName, setNewHeadName] = useState("");

  const { data: heads = [] } = useHeads();
  const invalidateData = useInvalidateData();
  const queryClient = useQueryClient();

  const filteredHeads = heads.filter((h) => h.type === type && !h.archived);

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setSummary("");
      setDate(todayYMD());
      setHeadId("");
      setShowNewHead(false);
    }
  }, [isOpen, type]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0)
      return toast.error("Enter a valid amount");
    if (!headId) return toast.error("Select a category");

    setLoading(true);
    try {
      await API.post("/entries", {
        account: selectedAccount._id,
        type,
        mode,
        date,
        amount: parseFloat(amount),
        head: headId,
        summary,
      });
      toast.success("Entry added successfully!");
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
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${type === "expense" ? "bg-red-500 text-white shadow-sm" : "text-gray-600"}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${type === "income" ? "bg-emerald-500 text-white shadow-sm" : "text-gray-600"}`}
            >
              Income
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <form id="entry-form" onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full text-5xl font-bold text-center py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="0"
                autoFocus
                required
              />
            </div>

            <div className="flex justify-center gap-2">
              {[100, 500, 1000].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() =>
                    setAmount(
                      String((parseFloat(amount || 0) + val).toFixed(0)),
                    )
                  }
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full hover:bg-gray-200"
                >
                  +₹{val}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                Category
              </label>
              {!showNewHead ? (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {filteredHeads.map((h) => (
                    <button
                      type="button"
                      key={h._id}
                      onClick={() => setHeadId(h._id)}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${headId === h._id ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-100 bg-white text-gray-600"}`}
                    >
                      {h.emoji} {h.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowNewHead(true)}
                    className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border-2 border-dashed border-gray-200 text-gray-500 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> New
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newHeadName}
                    onChange={(e) => setNewHeadName(e.target.value)}
                    placeholder="Category Name"
                    className="input flex-1"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateHead}
                    className="btn-primary"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewHead(false)}
                    className="btn-secondary px-3"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                  Payment Mode
                </label>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setMode("cash")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${mode === "cash" ? "bg-amber-400 text-white shadow" : "text-gray-500"}`}
                  >
                    CASH
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("online")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${mode === "online" ? "bg-blue-500 text-white shadow" : "text-gray-500"}`}
                  >
                    ONLINE
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
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
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                Note (Optional)
              </label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="What was this for?"
                className="input"
                maxLength={200}
              />
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
          <button
            form="entry-form"
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 text-base shadow-lg shadow-primary-200"
          >
            {loading
              ? "Saving..."
              : `Save ${type === "income" ? "Income" : "Expense"}`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
