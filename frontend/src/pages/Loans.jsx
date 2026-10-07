import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, User, Plus } from 'lucide-react';
import { toast } from 'sonner';
import API from '../lib/api';
import { formatPaise, friendlyDate, todayYMD, cn } from '../lib/utils';
import { useApp } from '../context/AppContext';

export default function Loans() {
  const { selectedAccount } = useApp();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    person: '',
    direction: 'lent',
    amount: '',
    date: todayYMD(),
    note: '',
  });

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans', selectedAccount?._id],
    queryFn: () => API.get(`/loans?account=${selectedAccount._id}`),
    enabled: !!selectedAccount?._id,
  });

  const createMutation = useMutation({
    mutationFn: (data) => API.post('/loans', { ...data, account: selectedAccount._id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      toast.success('Loan record added');
      setShowAdd(false);
      setForm({ person: '', direction: 'lent', amount: '', date: todayYMD(), note: '' });
    },
    onError: (e) => toast.error(e.message),
  });

  const settleMutation = useMutation({
    mutationFn: ({ id, mode }) =>
      API.post(`/loans/${id}/settle`, { mode, date: todayYMD() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      toast.success('Settled successfully!');
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.person || !form.amount) return toast.error('Fill required fields');
    createMutation.mutate({ ...form, amount: parseFloat(form.amount) });
  };

  const handleSettle = (id) => {
    const mode = window.confirm('Settle via ONLINE? (Cancel = CASH)') ? 'online' : 'cash';
    settleMutation.mutate({ id, mode });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const pending = loans.filter((l) => l.status === 'pending');
  const returned = loans.filter((l) => l.status === 'returned');

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lent & Borrowed</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary py-2 px-3 text-xs">
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleSubmit}
          className="card p-5 space-y-4 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900"
        >
          <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-xl border border-gray-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setForm({ ...form, direction: 'lent' })}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-xs font-bold transition',
                form.direction === 'lent'
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-500 dark:text-zinc-400'
              )}
            >
              I Lent Money
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, direction: 'borrowed' })}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-xs font-bold transition',
                form.direction === 'borrowed'
                  ? 'bg-red-500 text-white'
                  : 'text-gray-500 dark:text-zinc-400'
              )}
            >
              I Borrowed
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Person *</label>
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
              <label className="text-[10px] font-bold text-gray-400 uppercase">Amount *</label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="input py-2"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Optional Note"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="input flex-1"
            />
            <button type="submit" disabled={createMutation.isPending} className="btn-primary px-6">
              Save
            </button>
          </div>
        </form>
      )}

      <div>
        <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-3 pl-2">
          Pending ({pending.length})
        </h3>
        <div className="card divide-y divide-gray-100 dark:divide-zinc-800">
          {pending.length === 0 && (
            <div className="p-6 text-center text-gray-400 dark:text-zinc-500 text-sm">
              All cleared! No pending records.
            </div>
          )}
          {pending.map((loan) => (
            <div key={loan._id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white',
                    loan.direction === 'lent' ? 'bg-emerald-500' : 'bg-red-500'
                  )}
                >
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-zinc-100 text-sm">{loan.person}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    {loan.direction === 'lent' ? 'You lent them' : 'You borrowed'}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">
                    {friendlyDate(loan.date)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={cn(
                    'font-bold text-base',
                    loan.direction === 'lent'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {formatPaise(loan.amountPaise)}
                </span>
                <button
                  onClick={() => handleSettle(loan._id)}
                  className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
                >
                  Mark Settled
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {returned.length > 0 && (
        <div className="opacity-70">
          <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-3 pl-2">
            Settled ({returned.length})
          </h3>
          <div className="card divide-y divide-gray-100 dark:divide-zinc-800">
            {returned.map((loan) => (
              <div key={loan._id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-600 dark:text-zinc-400 text-sm line-through">
                      {loan.person}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500">
                      Settled on {friendlyDate(loan.settledOn)}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-sm text-gray-400 dark:text-zinc-500">
                  {formatPaise(loan.amountPaise)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}