import { StickyNote } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Floating shortcut to the quick note. Sits above the add-entry FAB and only
 * shows where the desktop note panel (2xl+) is not visible.
 */
export default function NoteButton({ onClick, hasNote = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open quick note"
      title="Quick note"
      data-dialog-return-focus
      className={cn(
        "fixed bottom-[calc(160px+env(safe-area-inset-bottom))] right-4 z-50",
        "flex h-12 w-12 items-center justify-center rounded-2xl",
        "border border-white/60 bg-white/70 text-indigo-600 shadow-card backdrop-blur-xl",
        "ring-1 ring-slate-900/5 transition duration-200",
        "hover:-translate-y-0.5 hover:bg-white/90 active:scale-95",
        "dark:border-white/10 dark:bg-zinc-900/60 dark:text-indigo-300 dark:ring-white/5 dark:hover:bg-zinc-800/80",
        "relative sm:bottom-[100px] sm:right-8 2xl:hidden",
      )}
    >
      <StickyNote className="h-5 w-5" aria-hidden="true" />
      {hasNote && (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-zinc-900"
        />
      )}
    </button>
  );
}
