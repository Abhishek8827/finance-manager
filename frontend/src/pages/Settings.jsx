import { useState } from "react";
import {
  CheckCircle,
  Download,
  FileJson,
  Moon,
  RotateCcw,
  Share,
  Smartphone,
  Sun,
  Monitor,
  Trash2,
  Loader2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import API from "../lib/api";
import { useApp } from "../context/AppContext";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { useTheme } from "../hooks/useTheme";
import Segmented from "../components/ui/Segmented";
import Sheet from "../components/ui/Sheet";

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default function Settings() {
  const { selectedAccount } = useApp();
  const queryClient = useQueryClient();
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const { theme, setTheme } = useTheme();
  const [busy, setBusy] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleExport = async (type) => {
    if (!selectedAccount?._id) return;
    setBusy(type);
    try {
      const blob = await API.get(
        `/export.${type}?account=${selectedAccount._id}`,
        { responseType: "blob" },
      );
      downloadBlob(
        new Blob([blob]),
        `finance-${selectedAccount.name.toLowerCase().replace(/\s+/g, "-")}.${type}`,
      );
      toast.success(`${type === "csv" ? "CSV" : "JSON"} downloaded`);
    } catch (e) {
      toast.error(e.message || "Export failed");
    } finally {
      setBusy("");
    }
  };

  const handleBackup = async () => {
    if (!selectedAccount?._id) return;
    setBusy("backup");
    try {
      const blob = await API.get(
        `/backup.json?account=${selectedAccount._id}`,
        { responseType: "blob" },
      );
      downloadBlob(
        new Blob([blob], { type: "application/json" }),
        `finance-backup-${new Date().toISOString().split("T")[0]}.json`,
      );
      toast.success("Backup downloaded");
    } catch (e) {
      toast.error(e.message || "Backup failed");
    } finally {
      setBusy("");
    }
  };

  const handleInstallClick = async () => {
    const success = await installApp();
    if (success) toast.success("App installed on your home screen");
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
    <div className="animate-fade-in space-y-5 pb-4">
      <div>
        <p className="section-label">Settings</p>
        <h1 className="page-title mt-1">Preferences &amp; data</h1>
        <p className="page-subtitle">
          Everything is stored privately in your own database.
        </p>
      </div>

      {/* Account */}
      <section className="card">
        <div className="card-head">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Active account
          </h2>
        </div>
        <div className="card-body flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl text-base font-bold text-white"
            style={{ backgroundColor: selectedAccount?.color || "#6366f1" }}
          >
            {(selectedAccount?.name || "A").trim().slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {selectedAccount?.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Switch or rename accounts from the menu in the header.
            </p>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="card">
        <div className="card-head">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Appearance
          </h2>
        </div>
        <div className="card-body">
          <Segmented
            ariaLabel="Theme"
            value={theme}
            onChange={setTheme}
            options={[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
              { value: "system", label: "System", icon: Monitor },
            ]}
          />
          <p className="mt-2 text-[11px] text-slate-500 dark:text-zinc-400">
            System follows your device setting automatically.
          </p>
        </div>
      </section>

      {/* Install */}
      <section className="card">
        <div className="card-head">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Install app
          </h2>
        </div>
        <div className="card-body">
          {isInstalled ? (
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">Installed on this device</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  You’re using the installed app version.
                </p>
              </div>
            </div>
          ) : isInstallable ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                  <Smartphone className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Add to home screen
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Works offline-first and opens full screen.
                  </p>
                </div>
              </div>
              <button onClick={handleInstallClick} className="btn-primary btn-sm">
                Install
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:bg-zinc-800/50 dark:text-zinc-300">
              <Share
                className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500"
                aria-hidden="true"
              />
              <p>
                On iPhone or iPad: open this site in <b>Safari</b>, tap{" "}
                <b>Share</b>, then <b>Add to Home Screen</b>.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Data */}
      <section className="card overflow-hidden">
        <div className="card-head">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Backup &amp; export
          </h2>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            {selectedAccount?.name}
          </span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          <button
            onClick={() => handleExport("csv")}
            disabled={Boolean(busy)}
            className="row-hover flex w-full items-center gap-3 px-4 py-3.5 text-left disabled:opacity-60 sm:px-5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
              {busy === "csv" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="h-4 w-4" aria-hidden="true" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                Export transactions
              </span>
              <span className="block text-xs text-slate-500 dark:text-zinc-400">
                CSV for Excel or Google Sheets
              </span>
            </span>
            <Download className="h-4 w-4 text-slate-300" aria-hidden="true" />
          </button>

          <button
            onClick={handleBackup}
            disabled={Boolean(busy)}
            className="row-hover flex w-full items-center gap-3 px-4 py-3.5 text-left disabled:opacity-60 sm:px-5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300">
              {busy === "backup" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <FileJson className="h-4 w-4" aria-hidden="true" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                Full JSON backup
              </span>
              <span className="block text-xs text-slate-500 dark:text-zinc-400">
                Entries, categories and loans in one file
              </span>
            </span>
            <Download className="h-4 w-4 text-slate-300" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Danger zone */}
      <section className="card overflow-hidden border-rose-200/80 dark:border-rose-950/70">
        <div className="border-b border-rose-100 bg-rose-50/60 px-4 py-3 dark:border-rose-950/70 dark:bg-rose-950/20 sm:px-5">
          <h2 className="text-sm font-bold text-rose-700 dark:text-rose-300">
            Danger zone
          </h2>
        </div>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Reset all finance data
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-zinc-400">
              Deletes entries, categories, loans and recurring payments. Accounts
              are kept.
            </p>
          </div>
          <button
            onClick={() => setShowReset(true)}
            className="btn-danger w-full shrink-0 sm:w-auto"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Reset data
          </button>
        </div>
      </section>

      <Sheet
        open={showReset}
        onClose={() => setShowReset(false)}
        size="sm"
        title="Reset all finance data?"
        description="This permanently removes every transaction, category and loan. Your accounts are kept. This cannot be undone."
        footer={
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowReset(false)}
              disabled={resetting}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleFullReset}
              disabled={resetting}
              className="btn-danger"
            >
              {resetting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Resetting…
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Delete everything
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="pb-2" />
      </Sheet>
    </div>
  );
}
