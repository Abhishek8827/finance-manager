import { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useDialogAccessibility from "../../hooks/useDialogAccessibility";
import { cn } from "../../lib/utils";

/**
 * Shared dialog surface: a bottom sheet on phones, a centered card on larger
 * screens. Handles focus trap, Escape, backdrop click and body scroll lock.
 */
export default function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  labelledBy,
}) {
  const dialogRef = useDialogAccessibility(open, onClose);

  // Keep the page behind the sheet from scrolling on touch devices.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const widths = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            aria-label={!labelledBy ? title : undefined}
            tabIndex={-1}
            initial={{ y: 24, opacity: 0, scale: 0.99 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className={cn(
              "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl",
              "dark:bg-zinc-900 sm:rounded-3xl",
              widths[size] || widths.md,
            )}
          >
            <div
              aria-hidden="true"
              className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-slate-200 dark:bg-zinc-700 sm:hidden"
            />

            <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4 sm:pt-5">
              <div className="min-w-0">
                {title && (
                  <h2
                    id={labelledBy}
                    className="text-lg font-bold tracking-tight text-slate-900 dark:text-white"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-zinc-400">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="icon-btn -mr-1.5 -mt-1"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">
              {children}
            </div>

            {footer && (
              <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-4 pb-safe dark:border-zinc-800 dark:bg-zinc-950/40">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
