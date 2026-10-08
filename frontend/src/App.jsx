import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext";
import Layout from "./components/Layout";
import { RefreshCw, Server } from "lucide-react";

const Summary = lazy(() => import("./pages/Summary"));
const Entries = lazy(() => import("./pages/Entries"));
const Loans = lazy(() => import("./pages/Loans"));
const Settings = lazy(() => import("./pages/Settings"));

function PageLoader() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const { loading, selectedAccount, error, retry } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950 text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-gray-800 dark:text-zinc-200">
          Connecting to server...
        </h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 max-w-xs">
          Free servers may take up to 50 seconds on first open.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950 text-center">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-2xl flex items-center justify-center mb-4">
          <Server className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Connection Failed
        </h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 max-w-xs mb-6">
          {error}
        </p>
        <button
          onClick={retry}
          className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (!selectedAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500 dark:text-zinc-400">
        No accounts found. Run seed on backend.
      </div>
    );
  }

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
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
