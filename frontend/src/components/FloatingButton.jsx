import { useState, useRef, useEffect } from "react";
import { Plus, ArrowRightLeft, ReceiptText } from "lucide-react";
import { cn } from "../lib/utils";

export default function FloatingButton({ onAddClick, onTransferClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        ref.current?.querySelector("[data-dialog-return-focus]")?.focus();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const actions = [
    {
      label: "Add entry",
      icon: ReceiptText,
      onClick: onAddClick,
      tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300",
    },
    {
      label: "Transfer",
      icon: ArrowRightLeft,
      onClick: onTransferClick,
      tone: "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300",
    },
  ];

  return (
    <div
      ref={ref}
      onMouseEnter={() => {
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          setIsOpen(true);
        }
      }}
      onMouseLeave={() => {
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          setIsOpen(false);
        }
      }}
      className="fixed bottom-[calc(92px+env(safe-area-inset-bottom))] right-4 z-50 sm:bottom-8 sm:right-8"
    >
      {isOpen && (
        <div
          id="quick-actions-menu"
          aria-label="Quick actions"
          className="absolute bottom-[128px] right-0 mb-1 flex animate-fade-in flex-col items-end gap-2.5 2xl:bottom-[68px]"
        >
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                setIsOpen(false);
                action.onClick();
              }}
              className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-2 pl-4 pr-2 text-sm font-semibold text-slate-700 shadow-card transition hover:bg-slate-50 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              {action.label}
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  action.tone,
                )}
              >
                <action.icon className="h-4 w-4" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
        aria-expanded={isOpen}
        aria-controls="quick-actions-menu"
        data-dialog-return-focus
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-float",
          "transition duration-200 hover:scale-105 active:scale-95",
        )}
      >
        <Plus
          className={cn(
            "h-6 w-6 transition-transform duration-200",
            isOpen && "rotate-45",
          )}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
