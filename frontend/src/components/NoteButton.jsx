import { StickyNote } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Floating "balloon" shortcut to the quick note. It sits directly above the
 * add-entry FAB and only shows where the desktop note panel (2xl+) is hidden.
 *
 * The wrapper is exactly as wide as the FAB (56px) and shares its right offset,
 * so the 48px circle lands dead-centre on the FAB's vertical axis instead of
 * being right-aligned like a tile.
 */
export default function NoteButton({ onClick, hasNote = false }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-[calc(160px+env(safe-area-inset-bottom))] right-4 z-50",
        "flex w-14 justify-center",
        "sm:bottom-[100px] sm:right-8 2xl:hidden",
      )}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={hasNote ? "Open quick note (has content)" : "Open quick note"}
        title="Quick note"
        data-dialog-return-focus
        className={cn(
          "pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-full",
          "border border-white/70 bg-white/55 text-indigo-600 shadow-card ring-1 ring-slate-900/5",
          "backdrop-blur-xl backdrop-saturate-150",
          "transition duration-200 hover:-translate-y-0.5 hover:bg-white/85 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
          "dark:border-white/10 dark:bg-zinc-900/55 dark:text-indigo-300 dark:ring-white/5 dark:hover:bg-zinc-800/80 dark:focus-visible:ring-offset-zinc-950",
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
    </div>
  );
}
