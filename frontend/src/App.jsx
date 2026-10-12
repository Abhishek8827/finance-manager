import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext";
import Layout from "./components/Layout";
import Summary from "./pages/Summary";
import AccessGate from "./components/AccessGate";

const Entries = lazy(() => import("./pages/Entries"));
const Loans = lazy(() => import("./pages/Loans"));
const Settings = lazy(() => import("./pages/Settings"));

export default function App() {
  const { authenticated, loading, selectedAccount } = useApp();

  if (!authenticated) return <AccessGate />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!selectedAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No accounts found. Seed the database.
      </div>
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
