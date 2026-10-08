import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, RefreshCw, X } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

export default function PWAManager() {
  // 1. HANDLE APP UPDATES (New code deployed to Netlify)
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered successfully");
    },
    onRegisterError(error) {
      console.error("SW Registration error", error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast.custom(
        (t) => (
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-900 rounded-2xl shadow-xl p-4 flex gap-3 items-start">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Update Available!
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                A new version of FinanceManager is ready.
              </p>
              <button
                onClick={() => {
                  updateServiceWorker(true);
                  toast.dismiss(t);
                }}
                className="mt-3 w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-indigo-700 transition"
              >
                Reload to Update
              </button>
            </div>
          </div>
        ),
        { duration: Infinity, position: "top-center" },
      );
    }
  }, [needRefresh, updateServiceWorker]);

  // 2. HANDLE INSTALLATION (Add to Home Screen)
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault(); // Prevent default mini-infobar
      setDeferredPrompt(e);

      // Only show install prompt once every 24 hours so it isn't annoying
      const lastPrompt = localStorage.getItem("pwa_install_prompt_time");
      const now = Date.now();
      if (!lastPrompt || now - Number(lastPrompt) > 24 * 60 * 60 * 1000) {
        setTimeout(() => showInstallToast(e), 3000); // Wait 3 seconds before showing
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const showInstallToast = (promptEvent) => {
    localStorage.setItem("pwa_install_prompt_time", Date.now().toString());

    toast.custom(
      (t) => (
        <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl p-4 flex gap-3 items-start">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              Install App
            </p>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Add FinanceManager to your home screen for fullscreen access.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={async () => {
                  promptEvent.prompt();
                  const { outcome } = await promptEvent.userChoice;
                  if (outcome === "accepted")
                    toast.success("App installed successfully!");
                  toast.dismiss(t);
                }}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-emerald-700 transition"
              >
                Install Now
              </button>
              <button
                onClick={() => toast.dismiss(t)}
                className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 text-xs font-bold rounded-lg hover:bg-gray-200 transition"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ),
      { duration: 15000, position: "bottom-center" },
    );
  };

  return null;
}
