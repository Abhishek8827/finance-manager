import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { WifiOff } from "lucide-react";
import { useOnline } from "../hooks/useOnline";

const TITLES = {
  "/": "Overview",
  "/entries": "Activity",
  "/loans": "Loans",
  "/settings": "Settings",
};

/** Keeps scroll position and document title in sync with the current route. */
export default function RouteChrome() {
  const { pathname } = useLocation();
  const online = useOnline();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.title = `${TITLES[pathname] || "Finance"} · Finance Manager`;
  }, [pathname]);

  if (online) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-[11px] font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
    >
      <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
      You’re offline — showing what was already loaded. Changes will fail until
      you reconnect.
    </div>
  );
}
