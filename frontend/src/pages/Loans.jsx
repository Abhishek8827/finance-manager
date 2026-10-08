import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, User, Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import API from "../lib/api";
import { formatPaise, friendlyDate, todayYMD, cn } from "../lib/utils";
import { useApp } from "../context/AppContext";

const emptyForm = {
  person: "",
  direction: "lent",
  mode: "online",
  amount: "",
  date: todayYMD(),
  note: "",
};

export default function Loans() {
  const { selectedAccount } = useApp();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ["loans", selectedAccount?._id],
    queryFn: () => API.get(`/loans?account=${selectedAccount._id}`),
    enabled: !!selectedAccount?._id,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["loans"] });
    queryClient.invalidateQueries({ queryKey: ["summary"] });
    queryClient.invalidateQueries({ queryKey: ["entries"] });
  };

  const createMutation = useMutation({
    mutationFn: (data) =>
      API.post("/loans", { ...data, account: selectedAccount._id }),
    onSuccess: () => {
      invalidateAll();
      toast.success("Loan saved. Wallet updated.");
      closeForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => API.put(`/loans/${id}`, data),
    onSuccess: () => {
      invalidateAll();
      toast.success("Loan updated. Wallet updated.");
      closeForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const settleMutation = useMutation({
    mutationFn: ({ id, mode }) =>
      API.post(`/loans/${id}/settle`, { mode, date: todayYMD() }),
    onSuccess: () => {
      invalidateAll();
      toast.success("Settled. Money moved back into wallet.");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => API.delete(`/loans/${id}`),
    onSuccess: () => {
      invalidateAll();
      toast.success("Loan deleted. Wallet reversed.");
    },
    onError: (e) => toast.error(e.message),
  });

  const closeForm = () => {
    setShowForm(false);
    setEditingLoan(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setEditingLoan(null);
    setForm({ ...emptyForm, date: todayYMD() });
    setShowForm(true);
  };

  const openEdit = (loan) => {
    if (loan.status === "returned") {
      toast.error(
        "Settled loans cannot be edited. Delete and recreate if needed.",
      );
      return;
    }
    setEditingLoan(loan);
    setForm({
      person: loan.person || "",
      direction: loan.direction || "lent",
      mode: "online", // mode is on entry; default online for edit UI
      amount: String((loan.amountPaise || 0) / 100),
      date: loan.date || todayYMD(),
      note: loan.note || "",
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.person.trim() || !form.amount) {
      return toast.error("Person and amount are required");
    }
    const payload = {
      person: form.person.trim(),
      direction: form.direction,
      mode: form.mode,
      amount: parseFloat(form.amount),
      date: form.date,
      note: form.note || "",
    };

    if (editingLoan) {
      updateMutation.mutate({ id: editingLoan._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleSettle = (id) => {
    const online = window.confirm(
      "Settle via ONLINE?\n\nOK = Online\nCancel = Cash",
    );
    settleMutation.mutate({ id, mode: online ? "online" : "cash" });
  };

  const handleDelete = (loan) => {
    const msg =
      loan.status === "pending"
        ? `Delete loan with ${loan.person} for ${formatPaise(loan.amountPaise)}?\n\nThis will reverse the wallet entry.`
        : `Delete settled loan with ${loan.person}?\n\nLinked wallet entries will be removed.`;
    if (!window.confirm(msg)) return;
    deleteMutation.mutate(loan._id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const pending = loans.filter((l) => l.status === "pending");
  const returned = loans.filter((l) => l.status === "returned");
  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lent & Borrowed
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Lending deducts from wallet · Settling restores wallet · Edit/Delete
            supported
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary py-2 px-3 text-xs">
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      {/* CREATE / EDIT FORM */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="card p-5 space-y-4 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900 relative"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-100">
              {editingLoan ? "Edit Loan" : "New Loan"}
            </h3>
            <button
              type="button"
              onClick={closeForm}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-xl border border-gray-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setForm({ ...form, direction: "lent" })}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-xs font-bold transition",
                form.direction === "lent"
                  ? "bg-emerald-500 text-white"
                  : "text-gray-500 dark:text-zinc-400",
              )}
            >
              I Lent (Leaves Wallet)
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, direction: "borrowed" })}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-xs font-bold transition",
                form.direction === "borrowed"
                  ? "bg-red-500 text-white"
                  : "text-gray-500 dark:text-zinc-400",
              )}
            >
              I Borrowed (Enters Wallet)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Person *
              </label>
              <input
                type="text"
                value={form.person}
                onChange={(e) => setForm({ ...form, person: e.target.value })}
                className="input py-2"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="input py-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Mode
              </label>
              <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-xl border border-gray-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, mode: "cash" })}
                  className={cn(
                    "flex-1 py-1 rounded-lg text-xs font-bold transition",
                    form.mode === "cash"
                      ? "bg-amber-400 text-white"
                      : "text-gray-500",
                  )}
                >
                  CASH
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, mode: "online" })}
                  className={cn(
                    "flex-1 py-1 rounded-lg text-xs font-bold transition",
                    form.mode === "online"
                      ? "bg-blue-500 text-white"
                      : "text-gray-500",
                  )}
                >
                  ONLINE
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input py-1.5"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Optional note"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="input flex-1"
            />
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-5 whitespace-nowrap"
            >
              {saving ? "Saving..." : editingLoan ? "Update" : "Save Loan"}
            </button>
          </div>
        </form>
      )}

      {/* PENDING */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-3 pl-2">
          Pending ({pending.length})
        </h3>
        <div className="card divide-y divide-gray-100 dark:divide-zinc-800">
          {pending.length === 0 && (
            <div className="p-6 text-center text-gray-400 dark:text-zinc-500 text-sm">
              No pending loans
            </div>
          )}
          {pending.map((loan) => (
            <div
              key={loan._id}
              className="p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0",
                    loan.direction === "lent" ? "bg-emerald-500" : "bg-red-500",
                  )}
                >
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 dark:text-zinc-100 text-sm truncate">
                    {loan.person}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    {loan.direction === "lent"
                      ? "You lent them"
                      : "You borrowed"}
                  </p>
                  {loan.note && (
                    <p className="text-[11px] text-gray-400 dark:text-zinc-500 truncate">
                      {loan.note}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">
                    {friendlyDate(loan.date)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className={cn(
                    "font-bold text-base",
                    loan.direction === "lent"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400",
                  )}
                >
                  {formatPaise(loan.amountPaise)}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(loan)}
                    className="p-1.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(loan)}
                    className="p-1.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleSettle(loan._id)}
                    className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full"
                  >
                    Settle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SETTLED */}
      {returned.length > 0 && (
        <div className="opacity-80">
          <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-3 pl-2">
            Settled ({returned.length})
          </h3>
          <div className="card divide-y divide-gray-100 dark:divide-zinc-800">
            {returned.map((loan) => (
              <div
                key={loan._id}
                className="p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-600 dark:text-zinc-400 text-sm line-through truncate">
                      {loan.person}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500">
                      Settled on {friendlyDate(loan.settledOn)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-sm text-gray-400 dark:text-zinc-500">
                    {formatPaise(loan.amountPaise)}
                  </span>
                  <button
                    onClick={() => handleDelete(loan)}
                    className="p-1.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-red-600"
                    title="Delete settled loan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
