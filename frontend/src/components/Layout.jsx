import { useState } from "react";
import { NavLink } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import FloatingButton from "./FloatingButton";
import AddEntryModal from "./AddEntryModal";
import TransferModal from "./TransferModal";
import {
  LayoutDashboard,
  ListOrdered,
  HandCoins,
  Settings,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { path: "/", label: "Summary", icon: LayoutDashboard },
  { path: "/entries", label: "Entries", icon: ListOrdered },
  { path: "/loans", label: "Loans", icon: HandCoins },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Layout({ children }) {
  const [addOpen, setAddOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-neutral-950 transition-colors duration-200">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 pb-24 sm:pb-6">
        {children}
      </main>

      {/* Footer — sits above mobile nav */}
      <div className="pb-16 sm:pb-0">
        <Footer />
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 glass border-t border-gray-200 dark:border-neutral-800 z-40">
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <FloatingButton
        onAddClick={() => setAddOpen(true)}
        onTransferClick={() => setTransferOpen(true)}
      />

      <AnimatePresence>
        {addOpen && (
          <AddEntryModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
        )}
        {transferOpen && (
          <TransferModal
            isOpen={transferOpen}
            onClose={() => setTransferOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
