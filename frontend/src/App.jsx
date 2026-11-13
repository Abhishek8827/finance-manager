import { lazy, Suspense, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext";
import Layout from "./components/Layout";
import Summary from "./pages/Summary";
import { Loader2, RotateCw, ShieldCheck, Sparkles, Wallet, WifiOff } from "lucide-react";
import { toast } from "sonner";

const Entries = lazy(() => import("./pages/Entries"));
const Loans = lazy(() => import("./pages/Loans"));
const Settings = lazy(() => import("./pages/Settings"));

export default function App() {
  const { loading, selectedAccount, createAccount, loadError, reload } =
    useApp();
  const [accountName, setAccountName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreateAccount = async (event) => {
    event.preventDefault();
    const name = accountName.trim();
    if (!name) return;

    setCreating(true);
    try {
      await createAccount(name);
      setAccountName("");
    } catch (error) {
      toast.error(error.message || "Couldn’t create the account");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-zinc-950">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white">
          <Wallet className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading your ledger…
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-zinc-950">
        <div className="card w-full max-w-sm p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
            <WifiOff className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            Can’t reach your data
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-zinc-400">
            {loadError.status === 401
              ? "Your session has expired. Unlock the app to continue."
              : loadError.status === 503
                ? "The API isn’t configured yet. Set APP_ACCESS_PASSWORD and JWT_SECRET on the backend."
                : "The app couldn’t load your accounts. Check your connection and try again."}
          </p>
          <button onClick={() => reload()} className="btn-primary mt-5 w-full">
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!selectedAccount) {
    return (
      <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 dark:bg-zinc-950">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-900/20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-900/20"
        />

        <div className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-card dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-2">
          <section className="hidden flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 text-white md:flex">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/20">
                <Wallet className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-bold">Finance Manager</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold leading-tight tracking-tight">
                Clarity for every rupee.
              </h2>
              <p className="mt-2 text-sm leading-6 text-indigo-100">
                Track income, spending, transfers and loans in one private
                ledger — with insights that actually make sense.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs text-indigo-100">
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Category insights and 6-month trends
                </li>
                <li className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" aria-hidden="true" />
                  Cash and online balances kept separate
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  Your data stays in your own database
                </li>
              </ul>
            </div>
            <p className="text-[11px] text-indigo-200">
              Works on mobile · installable as an app
            </p>
          </section>

          <section className="p-7 sm:p-9">
            <div className="flex items-center gap-2.5 md:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Wallet className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Finance Manager
              </span>
            </div>

            <h1 className="mt-6 text-xl font-bold tracking-tight text-slate-900 dark:text-white md:mt-0">
              Create your first account
            </h1>
            <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-zinc-400">
              Start with a personal, family or business ledger. You can add more
              accounts later and switch anytime.
            </p>

            <form onSubmit={handleCreateAccount} className="mt-6 space-y-3">
              <label htmlFor="first-account-name" className="label">
                Account name
              </label>
              <input
                id="first-account-name"
                className="input"
                value={accountName}
                onChange={(event) => setAccountName(event.target.value)}
                placeholder="e.g. Personal"
                maxLength={40}
                autoComplete="organization"
                autoFocus
                required
              />
              <button
                type="submit"
                disabled={creating || !accountName.trim()}
                className="btn-primary w-full py-3"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Creating…
                  </>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            <p className="mt-4 text-[11px] leading-5 text-slate-400 dark:text-zinc-500">
              Tip: use separate accounts for yourself, family members or a side
              business to keep reports clean.
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <Layout>
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2
              className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400"
              aria-hidden="true"
            />
            <span className="sr-only">Loading page</span>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Summary />} />
          <Route path="/entries" element={<Entries />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
