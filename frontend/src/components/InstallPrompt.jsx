import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, X } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

export default function InstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (isInstalled || !isInstallable || shown) return;

    const last = localStorage.getItem("installPromptAt");
    const oneDay = 24 * 60 * 60 * 1000;
    if (last && Date.now() - Number(last) < oneDay) return;

    const t = setTimeout(() => {
      localStorage.setItem("installPromptAt", String(Date.now()));
      setShown(true);

      toast.custom(
        (id) => (
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-xl p-4 flex gap-3 items-start">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Install Finance Manager
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Add to home screen for faster access and fullscreen app mode.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={async () => {
                    await installApp();
                    toast.dismiss(id);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Install
                </button>
                <button
                  onClick={() => toast.dismiss(id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={() => toast.dismiss(id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ),
        { duration: 12000, position: "bottom-center" },
      );
    }, 4000); // wait 4s after load so it doesn't fight cold start

    return () => clearTimeout(t);
  }, [isInstallable, isInstalled, shown, installApp]);

  return null;
}
