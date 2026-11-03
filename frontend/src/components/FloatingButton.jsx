import { useState, useRef, useEffect } from "react";
import { Plus, ArrowRightLeft, ReceiptText } from "lucide-react";

export default function FloatingButton({ onAddClick, onTransferClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
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
      className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-50"
    >
      {isOpen && (
          <div
            id="quick-actions-menu"
            aria-label="Quick actions"
            className="absolute bottom-16 right-0 flex flex-col gap-3 items-end mb-2 animate-fade-in"
          >
            <button
              onClick={() => {
                setIsOpen(false);
                onAddClick();
              }}
              className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-card border border-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition active:scale-95 whitespace-nowrap"
            >
              Add Entry
              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <ReceiptText className="w-4 h-4" aria-hidden="true" />
              </div>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onTransferClick();
              }}
              className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-card border border-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition active:scale-95 whitespace-nowrap"
            >
              Transfer
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <ArrowRightLeft className="w-4 h-4" aria-hidden="true" />
              </div>
            </button>
          </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
        aria-expanded={isOpen}
        aria-controls="quick-actions-menu"
        data-dialog-return-focus
        className="w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg shadow-primary-200 flex items-center justify-center hover:bg-primary-700 hover:scale-105 hover:shadow-xl hover:shadow-primary-300 focus-visible:scale-105 transition-all duration-200 active:scale-95"
      >
        <Plus
          className={`w-7 h-7 transition-transform ${isOpen ? "rotate-45" : "rotate-0"}`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
