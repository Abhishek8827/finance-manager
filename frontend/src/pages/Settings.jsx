import {
  Download,
  FileJson,
  Smartphone,
  CheckCircle,
  Share,
} from "lucide-react";
import API from "../lib/api";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { usePWAInstall } from "../hooks/usePWAInstall";

export default function Settings() {
  const { selectedAccount } = useApp();
  const { isInstallable, isInstalled, installApp } = usePWAInstall();

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
    </div>
  );
}
