import { Check, Trash2 } from "lucide-react";
import Sheet from "./ui/Sheet";

/**
 * Glass popup version of the desktop quick-note panel. The note itself lives in
 * Layout so the textarea here and the desktop aside always edit the same text.
 */
export default function NoteModal({
  open,
  onClose,
  note,
  onChange,
  accountName,
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      glass
      title="Quick note"
      description={
        accountName
          ? `Private scratchpad for ${accountName} — saves as you type.`
          : "Private scratchpad — saves as you type."
      }
      footer={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={!note}
            className="btn-ghost btn-sm text-rose-600 hover:bg-rose-50 disabled:opacity-40 dark:text-rose-400 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </button>
          <span
            className="ml-auto hidden items-center gap-1 text-[11px] font-medium text-slate-500 sm:flex dark:text-zinc-400"
            aria-live="polite"
          >
            <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            Saved automatically
          </span>
          <button type="button" onClick={onClose} className="btn-primary btn-sm">
            Done
          </button>
        </div>
      }
    >
      <label htmlFor="quick-note" className="sr-only">
        Quick note
      </label>
      <textarea
        id="quick-note"
        value={note}
        onChange={(event) => onChange(event.target.value)}
        maxLength={10000}
        rows={9}
        placeholder="Bills to pay, money to collect, reminders for later…"
        className="min-h-[220px] w-full resize-y rounded-2xl border border-white/60 bg-white/55 p-4 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 dark:border-white/10 dark:bg-zinc-950/30 dark:text-zinc-100 dark:placeholder:text-zinc-500"
      />
      <p className="mt-2 flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500">
        <span>Only you can see this — it stays in your database.</span>
        <span className="money">{note.length}/10000</span>
      </p>
    </Sheet>
  );
}
