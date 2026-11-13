import { useSyncExternalStore } from "react";

function subscribe(callback) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

/** Reports connectivity so the UI can explain why a request may fail. */
export function useOnline() {
  return useSyncExternalStore(
    subscribe,
    () => (typeof navigator === "undefined" ? true : navigator.onLine),
    () => true,
  );
}
