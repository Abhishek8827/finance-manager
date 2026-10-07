import React from "react";
import { useApp } from "../context/AuthContext";

export default function Toast() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300 ${
            toast.type === "error"
              ? "bg-red-500"
              : toast.type === "warning"
                ? "bg-yellow-500"
                : "bg-emerald-500"
          }`}
          style={{ animation: "slideUp 0.3s ease-out" }}
        >
          <span className="text-lg">
            {toast.type === "error"
              ? "❌"
              : toast.type === "warning"
                ? "⚠️"
                : "✅"}
          </span>
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 text-white/80 hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
