import { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useDialogAccessibility from "../../hooks/useDialogAccessibility";
import { cn } from "../../lib/utils";

/**
 * Shared dialog surface: a bottom sheet on phones, a centered card on larger
 * screens. Handles focus trap, Escape, backdrop click and body scroll lock.
 *
 * Props:
 * - `center`: anchor the dialog in the middle of the screen at every breakpoint
 *   (used by popups, instead of a sheet that clings to the bottom edge).
 * - `glass`: frosted translucent surface instead of an opaque card.
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
  glass = false,
  center = false,
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
        <div
          className={cn(
            "fixed inset-0 z-[70] flex justify-center",
            center ? "items-center p-4" : "items-end sm:items-center sm:p-4",
          )}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className={cn(
              "absolute inset-0",
              glass
                ? "bg-slate-950/35 backdrop-blur-md"
                : "bg-slate-950/50 backdrop-blur-[2px]",
            )}
            onClick={onClose}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            aria-label={!labelledBy ? title : undefined}
            tabIndex={-1}
            initial={center ? { y: 10, opacity: 0, scale: 0.94 } : { y: 24, opacity: 0, scale: 0.99 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={center ? { y: 8, opacity: 0, scale: 0.96 } : { y: 16, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className={cn(
              "relative isolate flex w-full flex-col overflow-hidden",
              center
                ? "max-h-[86vh] rounded-3xl shadow-[0_30px_80px_-24px_rgba(2,6,23,0.55)]"
                : "max-h-[92vh] rounded-t-3xl shadow-2xl sm:rounded-3xl",
              widths[size] || widths.md,
              glass
                ? "border border-white/60 bg-white/55 ring-1 ring-white/50 backdrop-blur-3xl backdrop-saturate-150 dark:border-white/10 dark:bg-zinc-900/55 dark:ring-white/10"
                : "bg-white dark:bg-zinc-900",
            )}
          >
            {glass && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-white/5 to-transparent dark:from-white/10 dark:via-white/[0.03]"
              />
            )}

            <div
              aria-hidden="true"
              className={cn(
                "relative z-10 mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full",
                center ? "hidden" : "sm:hidden",
                glass ? "bg-slate-400/40 dark:bg-white/20" : "bg-slate-200 dark:bg-zinc-700",
              )}
            />

            <div className="relative z-10 flex items-start justify-between gap-4 px-5 pb-3 pt-5">
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
                className={cn(
                  "icon-btn -mr-1.5 -mt-1",
                  glass &&
                    "border border-white/50 bg-white/40 hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
                )}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">
              {children}
            </div>

            {footer && (
              <div
                className={cn(
                  "relative z-10 px-5 py-4",
                  center ? "" : "pb-safe",
                  glass
                    ? "border-t border-white/40 bg-white/25 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                    : "border-t border-slate-100 bg-slate-50/80 dark:border-zinc-800 dark:bg-zinc-950/40",
                )}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
