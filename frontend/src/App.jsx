import { lazy, Suspense, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext";
import Layout from "./components/Layout";
import Summary from "./pages/Summary";

const Entries = lazy(() => import("./pages/Entries"));
const Loans = lazy(() => import("./pages/Loans"));
const Settings = lazy(() => import("./pages/Settings"));

export default function App() {
  const { loading, selectedAccount, createAccount } = useApp();
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
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!selectedAccount) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-neutral-950">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
          <section className="card w-full p-5 sm:p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              +
            </div>
            <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
              Create your first account
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-zinc-400">
              Start with a personal, family, or business account.
            </p>
            <form onSubmit={handleCreateAccount} className="mt-5 space-y-3">
              <label htmlFor="first-account-name" className="sr-only">
                Account name
              </label>
              <input
                id="first-account-name"
                className="input"
                value={accountName}
                onChange={(event) => setAccountName(event.target.value)}
                placeholder="Account name"
                maxLength={40}
                autoComplete="organization"
                autoFocus
              />
              <button
                type="submit"
                disabled={creating || !accountName.trim()}
                className="btn-primary min-h-11 w-full"
              >
                {creating ? "Creating..." : "Create account"}
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  return (
    <Layout>
      <Suspense
        fallback={
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
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
