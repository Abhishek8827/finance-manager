import { Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext";
import Layout from "./components/Layout";
import Summary from "./pages/Summary";
import Entries from "./pages/Entries";
import Loans from "./pages/Loans";
import Settings from "./pages/Settings";
import { RefreshCw, Server } from "lucide-react";

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
          Free Render servers take up to 50 seconds to wake up on first load.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950 text-center">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-4">
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
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  if (!selectedAccount) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950 text-center">
        <p className="text-sm font-semibold text-gray-600 dark:text-zinc-300 mb-4">
          No accounts found in database.
        </p>
        <button onClick={retry} className="btn-primary text-xs py-2 px-4">
          Refresh
        </button>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Summary />} />
        <Route path="/entries" element={<Entries />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
