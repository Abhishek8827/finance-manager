import { Check, Trash2 } from "lucide-react";
import Sheet from "./ui/Sheet";

/**
 * Glass popup version of the desktop quick-note panel. The note itself lives in
 * Layout so the textarea here and the desktop aside always edit the same text.
 *
 * Rendered as a centered, frosted popup with no subtitle copy — just the note.
 */
export default function NoteModal({ open, onClose, note, onChange }) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      glass
      center
      title="Quick note"
      footer={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={!note}
            className="btn-ghost btn-sm text-rose-600 hover:bg-rose-50 disabled:opacity-40 dark:text-rose-400 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </button>

          <span className="ml-auto flex items-center gap-1.5">
            <Check
              className="h-3.5 w-3.5 text-emerald-500"
              aria-hidden="true"
            />
            <span
              className="money text-[11px] text-slate-400 dark:text-zinc-500"
              aria-hidden="true"
            >
              {note.length}/10000
            </span>
            <span className="sr-only" aria-live="polite">
              Note saved automatically
            </span>
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
        autoFocus
        value={note}
        onChange={(event) => onChange(event.target.value)}
        maxLength={10000}
        rows={10}
        placeholder="Bills to pay, money to collect, reminders for later…"
        className="min-h-[220px] w-full resize-none rounded-2xl border border-white/60 bg-white/45 p-4 text-sm leading-6 text-slate-800 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-indigo-400/70 focus:bg-white/65 focus:ring-2 focus:ring-indigo-400/30 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-indigo-400/50 dark:focus:bg-white/10"
      />
    </Sheet>
  );
}
