import { useState } from "react";
import {
  Download,
  FileJson,
  Smartphone,
  CheckCircle,
  Share,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import API from "../lib/api";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
// import { usePWAInstall } from "../hooks/usePWAInstall";
import { usePWAInstall } from "../hooks/usePWAInstall";

export default function Settings() {
  const { selectedAccount } = useApp();
  const queryClient = useQueryClient();
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const [showReset, setShowReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleExport = async (type) => {
    try {
      const res = await API.get(
        `/export.${type}?account=${selectedAccount._id}`,
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `FinanceExport_${selectedAccount?.name}_${type}.${type}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`${type.toUpperCase()} Exported!`);
    } catch (e) {
      toast.error("Export failed");
    }
  };

  const handleBackup = async () => {
    try {
      const res = await API.get(`/backup.json?account=${selectedAccount._id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Backup_${selectedAccount?.name}_${new Date().toISOString().split("T")[0]}.json`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Backup downloaded!");
    } catch (e) {
      toast.error("Backup failed");
    }
  };

  const handleInstallClick = async () => {
    const success = await installApp();
    if (success) {
      toast.success("App installed on Home Screen!");
    }
  };

  const handleFullReset = async () => {
    setResetting(true);
    try {
      await API.delete("/accounts/reset");
      localStorage.removeItem("selectedAccountId");
      queryClient.clear();
      setShowReset(false);
      toast.success("All finance data has been reset");
      window.location.reload();
    } catch (error) {
      toast.error(error.message || "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Settings
      </h2>

      {/* APP INSTALL CARD */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-widest">
            App Installation
          </h3>
        </div>
        <div className="p-5">
          {isInstalled ? (
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold text-sm">Installed on Device</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  You are using the installed app version.
                </p>
              </div>
            </div>
          ) : isInstallable ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-zinc-100 text-sm">
                    Install FinanceManager
                  </p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    Add app to your phone's home screen
                  </p>
                </div>
              </div>
              <button
                onClick={handleInstallClick}
                className="btn-primary text-xs py-2.5 px-4 w-full sm:w-auto"
              >
                Install Now
              </button>
            </div>
          ) : (
            <div className="space-y-2 text-xs text-gray-500 dark:text-zinc-400">
              <p className="font-semibold text-gray-700 dark:text-zinc-300">
                To install on iPhone / iPad (Safari):
              </p>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800/60 p-3 rounded-xl">
                <Share className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>
                  Tap <b>Share</b> in Safari, then select{" "}
                  <b>Add to Home Screen</b>.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DATA RESET */}
      <div className="card overflow-hidden border-red-100 dark:border-red-950/60">
        <div className="px-4 sm:px-5 py-3 bg-red-50/70 dark:bg-red-950/20 border-b border-red-100 dark:border-red-950/60">
          <h3 className="text-sm font-bold text-red-700 dark:text-red-300 uppercase tracking-widest">
            Danger Zone
          </h3>
        </div>
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <p className="font-bold text-gray-800 dark:text-zinc-100 text-sm">
              Full app reset
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-zinc-400">
              Permanently delete entries, heads, loans, and recurring payments.
              Accounts will be kept.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowReset(true)}
            className="inline-flex min-h-11 w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 active:bg-red-800"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Reset everything
          </button>
        </div>
      </div>

      {/* EXPORT DATA */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-widest">
            Export Data ({selectedAccount?.name})
          </h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
          <button
            onClick={() => handleExport("csv")}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition text-left"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-gray-800 dark:text-zinc-100 text-sm">
                Export to CSV
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Download entries for Excel / Google Sheets
              </p>
            </div>
          </button>

          <button
            onClick={handleBackup}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition text-left"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-gray-800 dark:text-zinc-100 text-sm">
                Full JSON Backup
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Download complete account backup
              </p>
            </div>
          </button>
        </div>
      </div>

      {showReset && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-title"
        >
          <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white p-5 pb-safe dark:bg-zinc-900 sm:max-w-md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                <RotateCcw className="h-5 w-5" aria-hidden="true" />
              </div>
              <button
                type="button"
                onClick={() => setShowReset(false)}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                aria-label="Close reset confirmation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <h2
              id="reset-title"
              className="mt-4 text-xl font-bold text-gray-900 dark:text-white"
            >
              Reset the entire app?
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-zinc-400">
              This permanently removes all finance records while keeping your
              accounts. This action cannot be undone.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowReset(false)}
                disabled={resetting}
                className="min-h-11 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFullReset}
                disabled={resetting}
                className="min-h-11 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
              >
                {resetting ? "Resetting..." : "Delete everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
