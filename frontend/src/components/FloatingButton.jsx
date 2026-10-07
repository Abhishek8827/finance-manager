import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowRightLeft, ReceiptText } from "lucide-react";

export default function FloatingButton({ onAddClick, onTransferClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={ref}
      className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-50"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            className="absolute bottom-16 right-0 flex flex-col gap-3 items-end mb-2"
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
                <ReceiptText className="w-4 h-4" />
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
                <ArrowRightLeft className="w-4 h-4" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg shadow-primary-200 flex items-center justify-center hover:bg-primary-700 transition-colors"
      >
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }}>
          <Plus className="w-7 h-7" />
        </motion.div>
      </motion.button>
    </div>
  );
}
