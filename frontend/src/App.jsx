import { Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext";
import Layout from "./components/Layout";
import Summary from "./pages/Summary";
import Entries from "./pages/Entries";
import Loans from "./pages/Loans";
import Settings from "./pages/Settings";

export default function App() {
  const { loading, selectedAccount } = useApp();

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
