import { useState } from "react";
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function AccessGate() {
  const { login, loading } = useApp();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await login(password);
      setPassword("");
    } catch (loginError) {
      setError(loginError.message || "Unable to unlock the app.");
    }
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f6f8] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-36 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -right-24 h-[30rem] w-[30rem] rounded-full bg-emerald-100/70 blur-3xl"
      />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_32px_100px_-48px_rgba(15,23,42,0.38)] lg:min-h-[610px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative flex min-h-[300px] flex-col justify-between overflow-hidden bg-[#111b35] p-7 text-white sm:p-10 lg:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-12 h-64 w-64 rounded-full border border-white/10"
          />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-indigo-200 ring-1 ring-white/15">
                <WalletCards size={22} aria-hidden="true" />
              </div>
              <span className="text-sm font-semibold tracking-wide text-white/90">
                Finance Manager
              </span>
            </div>

            <div className="mt-12 max-w-md sm:mt-16 lg:mt-20">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-200">
                Your money, in focus
              </p>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.7rem]">
                A clearer view of your finances starts here.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300 sm:text-base">
                Keep your income, expenses, accounts, and loans together in one
                calm, organized space.
              </p>
            </div>
          </div>

          <div className="relative mt-10 hidden max-w-md sm:block lg:mt-12">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/10 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white/90">
                    Your financial snapshot
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    Everything you need, all in one place
                  </p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-300/15 text-emerald-200">
                  <ArrowUpRight size={18} aria-hidden="true" />
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {["Income", "Expenses", "Loans"].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl bg-black/15 px-3 py-3 text-center text-xs font-medium text-slate-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-5 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={15} aria-hidden="true" />
              Private access to your finance workspace
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-14">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm"
            aria-labelledby="access-title"
          >
            <div className="mb-8 lg:mb-10">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                <LockKeyhole size={22} aria-hidden="true" />
              </div>
              <p className="mb-2 text-sm font-semibold text-indigo-700">
                Welcome back
              </p>
              <h2
                id="access-title"
                className="text-3xl font-semibold tracking-tight text-slate-900"
              >
                Sign in to continue
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your access password to open your finance workspace.
              </p>
            </div>

            <div>
              <label
                htmlFor="app-password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Access password
              </label>
              <div className="relative">
                <input
                  id="app-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  autoFocus
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-slate-700 focus-visible:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p
                id="login-error"
                role="alert"
                className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-indigo-700/25 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? "Signing in…" : "Continue securely"}
              {!loading && <ArrowUpRight size={17} aria-hidden="true" />}
            </button>

            <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={15} className="text-emerald-600" aria-hidden="true" />
              Your password is used only to unlock the app.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
