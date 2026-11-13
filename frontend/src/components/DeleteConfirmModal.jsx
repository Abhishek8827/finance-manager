import { AlertTriangle } from "lucide-react";
import Sheet from "./ui/Sheet";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete this record?",
  message = "This action cannot be undone.",
  confirmLabel = "Delete",
  busy = false,
}) {
  return (
    <Sheet
      open={isOpen}
      onClose={onClose}
      size="sm"
      title={title}
      footer={
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onClose} className="btn-secondary" disabled={busy}>
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger" disabled={busy}>
            {busy ? "Deleting…" : confirmLabel}
          </button>
        </div>
      }
    >
      <div className="pb-2 pt-1">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="text-sm leading-6 text-slate-500 dark:text-zinc-400">
          {message}
        </p>
      </div>
    </Sheet>
  );
}
