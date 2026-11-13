import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  HandCoins,
  Pencil,
  Plus,
  Smartphone,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import API from "../lib/api";
import { formatPaise, friendlyDate, todayYMD, cn } from "../lib/utils";
import { useApp } from "../context/AppContext";
import Segmented from "../components/ui/Segmented";
import Sheet from "../components/ui/Sheet";
import EmptyState from "../components/ui/EmptyState";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { StatSkeleton } from "../components/ui/Skeleton";

const emptyForm = {
  person: "",
  direction: "lent",
  mode: "online",
  amount: "",
  date: todayYMD(),
  dueDate: "",
  note: "",
};

export default function Loans() {
  const { selectedAccount } = useApp();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("pending");
  const [settlingLoan, setSettlingLoan] = useState(null);
  const [settleMode, setSettleMode] = useState("online");
  const [settleDate, setSettleDate] = useState(todayYMD());
  const [deletingLoan, setDeletingLoan] = useState(null);

  const {
    data: loans = [],
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
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
      toast.success("Loan saved · wallet updated");
      closeForm();
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => API.put(`/loans/${id}`, data),
    onSuccess: () => {
      invalidateAll();
      toast.success("Loan updated");
      closeForm();
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  const settleMutation = useMutation({
    mutationFn: ({ id, mode, date }) =>
      API.post(`/loans/${id}/settle`, { mode, date }),
    onSuccess: () => {
      invalidateAll();
      toast.success("Loan settled · money moved back into your wallet");
      setSettlingLoan(null);
    },
    onError: (mutationError) => toast.error(mutationError.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => API.delete(`/loans/${id}`),
    onSuccess: () => {
      invalidateAll();
      toast.success("Loan deleted · wallet reversed");
      setDeletingLoan(null);
    },
    onError: (mutationError) => toast.error(mutationError.message),
  });

  const closeForm = () => {
    setShowForm(false);
    setEditingLoan(null);
    setForm(emptyForm);
    setError("");
  };

  const openCreate = () => {
    setEditingLoan(null);
    setForm({ ...emptyForm, date: todayYMD() });
    setError("");
    setShowForm(true);
  };

  const openEdit = (loan) => {
    if (loan.status === "returned") {
      toast.error("Settled loans can’t be edited. Delete and recreate instead.");
      return;
    }
    setEditingLoan(loan);
    setForm({
      person: loan.person || "",
      direction: loan.direction || "lent",
      mode: "online",
      amount: String((loan.amountPaise || 0) / 100),
      date: loan.date || todayYMD(),
      dueDate: loan.dueDate || "",
      note: loan.note || "",
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const parsed = parseFloat(form.amount);
    if (!form.person.trim() || Number.isNaN(parsed) || parsed <= 0) {
      setError("Add a person and an amount greater than zero.");
      return;
    }
    const payload = {
      person: form.person.trim(),
      direction: form.direction,
      amount: parsed,
      date: form.date,
      dueDate: form.dueDate || null,
      note: form.note || "",
    };
    // The wallet mode lives on the linked entry; only set it when creating a
    // loan so editing never silently moves money between cash and online.
    if (!editingLoan) payload.mode = form.mode;
    setError("");

    if (editingLoan) updateMutation.mutate({ id: editingLoan._id, data: payload });
    else createMutation.mutate(payload);
  };

  const pending = useMemo(
    () => loans.filter((loan) => loan.status === "pending"),
    [loans],
  );
  const returned = useMemo(
    () => loans.filter((loan) => loan.status === "returned"),
    [loans],
  );

  const youWillGet = pending
    .filter((loan) => loan.direction === "lent")
    .reduce((sum, loan) => sum + loan.amountPaise, 0);
  const youOwe = pending
    .filter((loan) => loan.direction === "borrowed")
    .reduce((sum, loan) => sum + loan.amountPaise, 0);

  const saving = createMutation.isPending || updateMutation.isPending;
  const visible = tab === "pending" ? pending : returned;

  const isOverdue = (loan) =>
    loan.status === "pending" &&
    loan.dueDate &&
    loan.dueDate < todayYMD();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="section-label">Loans</p>
          <h1 className="page-title">Lent & borrowed</h1>
        </div>
        <StatSkeleton count={3} />
        <StatSkeleton count={3} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card card-body text-center">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          Couldn’t load loans
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          {queryError?.message}
        </p>
        <button onClick={() => refetch()} className="btn-primary btn-sm mx-auto mt-4">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5 pb-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-label">Loans</p>
          <h1 className="page-title mt-1">Lent &amp; borrowed</h1>
          <p className="page-subtitle">
            Money outside your wallet, tracked separately from balances.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary btn-sm">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New loan
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="card card-body">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <ArrowDownLeft className="h-3 w-3" aria-hidden="true" />
            You’ll get
          </p>
          <p className="money mt-1.5 truncate text-base font-bold text-emerald-600 dark:text-emerald-400 sm:text-xl">
            {formatPaise(youWillGet)}
          </p>
        </div>
        <div className="card card-body">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            You owe
          </p>
          <p className="money mt-1.5 truncate text-base font-bold text-rose-600 dark:text-rose-400 sm:text-xl">
            {formatPaise(youOwe)}
          </p>
        </div>
        <div className="card card-body">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Net position
          </p>
          <p
            className={cn(
              "money mt-1.5 truncate text-base font-bold sm:text-xl",
              youWillGet - youOwe >= 0
                ? "text-slate-900 dark:text-white"
                : "text-rose-600 dark:text-rose-400",
            )}
          >
            {formatPaise(youWillGet - youOwe)}
          </p>
        </div>
      </div>

      <div className="seg max-w-sm">
        <button
          type="button"
          onClick={() => setTab("pending")}
          aria-pressed={tab === "pending"}
          className="seg-item"
        >
          Pending ({pending.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("returned")}
          aria-pressed={tab === "returned"}
          className="seg-item"
        >
          Settled ({returned.length})
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={HandCoins}
            title={
              tab === "pending"
                ? "No pending loans"
                : "Nothing settled yet"
            }
            description={
              tab === "pending"
                ? "Record money you lend or borrow to keep your wallet balances honest."
                : "Settled loans will be archived here for your records."
            }
            action={
              tab === "pending" ? (
                <button onClick={openCreate} className="btn-primary">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Record a loan
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="card divide-y divide-slate-100 overflow-hidden dark:divide-zinc-800">
          {visible.map((loan) => {
            const lent = loan.direction === "lent";
            const settled = loan.status === "returned";
            const overdue = isOverdue(loan);

            return (
              <div
                key={loan._id}
                className="row-hover flex items-start gap-3 px-4 py-3.5"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white",
                    settled
                      ? "bg-slate-300 dark:bg-zinc-700"
                      : lent
                        ? "bg-emerald-500"
                        : "bg-rose-500",
                  )}
                  aria-hidden="true"
                >
                  {loan.person.trim().slice(0, 1).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p
                      className={cn(
                        "truncate text-sm font-semibold",
                        settled
                          ? "text-slate-500 line-through dark:text-zinc-500"
                          : "text-slate-900 dark:text-zinc-100",
                      )}
                    >
                      {loan.person}
                    </p>
                    <span
                      className={cn(
                        "badge",
                        settled
                          ? "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400"
                          : lent
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
                      )}
                    >
                      {settled ? "Settled" : lent ? "Lent" : "Borrowed"}
                    </span>
                    {overdue && (
                      <span className="badge bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        Overdue
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                    {friendlyDate(loan.date)}
                    {loan.dueDate && !settled && ` · due ${friendlyDate(loan.dueDate)}`}
                    {settled && loan.settledOn && ` · settled ${friendlyDate(loan.settledOn)}`}
                  </p>
                  {loan.note && (
                    <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-zinc-500">
                      {loan.note}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span
                    className={cn(
                      "money text-sm font-bold",
                      settled
                        ? "text-slate-400 dark:text-zinc-500"
                        : lent
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400",
                    )}
                  >
                    {formatPaise(loan.amountPaise)}
                  </span>

                  {!settled ? (
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => {
                          setSettlingLoan(loan);
                          setSettleMode("online");
                          setSettleDate(todayYMD());
                        }}
                        className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                      >
                        Settle
                      </button>
                      <button
                        onClick={() => openEdit(loan)}
                        aria-label={`Edit loan with ${loan.person}`}
                        className="icon-btn h-8 w-8"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => setDeletingLoan(loan)}
                        aria-label={`Delete loan with ${loan.person}`}
                        className="icon-btn h-8 w-8 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingLoan(loan)}
                      aria-label={`Delete settled loan with ${loan.person}`}
                      className="icon-btn h-8 w-8 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / edit */}
      <Sheet
        open={showForm}
        onClose={closeForm}
        title={editingLoan ? "Edit loan" : "New loan"}
        description={
          editingLoan
            ? "Linked wallet entries update with the loan."
            : "Lending leaves your wallet · borrowing adds to it."
        }
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
              form="loan-form"
              type="submit"
              disabled={saving}
              className="btn-primary w-full py-3"
            >
              {saving ? "Saving…" : editingLoan ? "Update loan" : "Save loan"}
            </button>
          </div>
        }
      >
        <form id="loan-form" onSubmit={handleSubmit} className="space-y-4 pb-1">
          <div>
            <span className="label">Direction</span>
            <Segmented
              ariaLabel="Loan direction"
              value={form.direction}
              onChange={(value) =>
                setForm((current) => ({ ...current, direction: value }))
              }
              options={[
                { value: "lent", label: "I lent", icon: ArrowUpRight },
                { value: "borrowed", label: "I borrowed", icon: ArrowDownLeft },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="loan-person" className="label">
                Person
              </label>
              <input
                id="loan-person"
                type="text"
                value={form.person}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    person: event.target.value,
                  }))
                }
                className="input"
                placeholder="Name"
                maxLength={60}
                autoFocus
                required
              />
            </div>
            <div>
              <label htmlFor="loan-amount" className="label">
                Amount (₹)
              </label>
              <input
                id="loan-amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                className="input money"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="loan-date" className="label">
                Date
              </label>
              <input
                id="loan-date"
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
                className="input"
                required
              />
            </div>
            <div>
              <label htmlFor="loan-due" className="label">
                Due date <span className="font-normal normal-case tracking-normal text-slate-400">(optional)</span>
              </label>
              <input
                id="loan-due"
                type="date"
                value={form.dueDate || ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    dueDate: event.target.value,
                  }))
                }
                className="input"
              />
            </div>
          </div>

          {!editingLoan && (
            <div>
              <span className="label">Wallet mode</span>
              <Segmented
                ariaLabel="Wallet mode"
                value={form.mode}
                onChange={(value) =>
                  setForm((current) => ({ ...current, mode: value }))
                }
                options={[
                  { value: "cash", label: "Cash", icon: Banknote },
                  { value: "online", label: "Online", icon: Smartphone },
                ]}
              />
            </div>
          )}

          <div>
            <label htmlFor="loan-note" className="label">
              Note <span className="font-normal normal-case tracking-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="loan-note"
              type="text"
              value={form.note}
              onChange={(event) =>
                setForm((current) => ({ ...current, note: event.target.value }))
              }
              className="input"
              placeholder="What was it for?"
              maxLength={200}
            />
          </div>
        </form>
      </Sheet>

      {/* Settle */}
      <Sheet
        open={Boolean(settlingLoan)}
        onClose={() => setSettlingLoan(null)}
        size="sm"
        title="Settle loan"
        description={
          settlingLoan
            ? `${settlingLoan.direction === "lent" ? "Getting back" : "Paying back"} ${formatPaise(settlingLoan.amountPaise)} ${settlingLoan.direction === "lent" ? "from" : "to"} ${settlingLoan.person}.`
            : ""
        }
        footer={
          <button
            onClick={() =>
              settleMutation.mutate({
                id: settlingLoan._id,
                mode: settleMode,
                date: settleDate,
              })
            }
            disabled={settleMutation.isPending}
            className="btn-primary w-full py-3"
          >
            {settleMutation.isPending ? "Settling…" : "Confirm settlement"}
          </button>
        }
      >
        <div className="space-y-4 pb-1">
          <div>
            <span className="label">Settlement mode</span>
            <Segmented
              ariaLabel="Settlement mode"
              value={settleMode}
              onChange={setSettleMode}
              options={[
                { value: "cash", label: "Cash", icon: Banknote },
                { value: "online", label: "Online", icon: Smartphone },
              ]}
            />
          </div>
          <div>
            <label htmlFor="settle-date" className="label">
              Date
            </label>
            <input
              id="settle-date"
              type="date"
              value={settleDate}
              onChange={(event) => setSettleDate(event.target.value)}
              className="input"
            />
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-indigo-50/70 p-3 text-[11px] leading-5 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-200">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              This records the money back into your {settleMode} balance and
              archives the loan as settled.
            </p>
          </div>
        </div>
      </Sheet>

      <DeleteConfirmModal
        isOpen={Boolean(deletingLoan)}
        onClose={() => setDeletingLoan(null)}
        onConfirm={() => deleteMutation.mutate(deletingLoan._id)}
        busy={deleteMutation.isPending}
        title={
          deletingLoan?.status === "pending"
            ? "Delete this pending loan?"
            : "Delete this settled loan?"
        }
        message={
          deletingLoan
            ? `The loan with ${deletingLoan.person} (${formatPaise(deletingLoan.amountPaise)}) and its linked wallet entries will be removed.`
            : ""
        }
      />
    </div>
  );
}
