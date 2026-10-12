import { lazy, Suspense, useState } from "react";
import { NavLink } from "react-router-dom";
import Header from "./Header";
import FloatingButton from "./FloatingButton";
import {
  LayoutDashboard,
  ListOrdered,
  HandCoins,
  Settings,
} from "lucide-react";

const ModalHost = lazy(() => import("./ModalHost"));

const NAV_ITEMS = [
  { path: "/", label: "Summary", icon: LayoutDashboard },
  { path: "/entries", label: "Entries", icon: ListOrdered },
  { path: "/loans", label: "Loans", icon: HandCoins },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Layout({ children }) {
  const [addOpen, setAddOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [modalHostLoaded, setModalHostLoaded] = useState(false);

  const openAdd = () => {
    setModalHostLoaded(true);
    setAddOpen(true);
  };
  const openTransfer = () => {
    setModalHostLoaded(true);
    setTransferOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-neutral-950 transition-colors duration-200 pb-20 sm:pb-0">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-indigo-700 focus:rounded-lg"
      >
        Skip to main content
      </a>
      <Header />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6"
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav aria-label="Mobile navigation" className="sm:hidden fixed bottom-0 inset-x-0 glass border-t border-gray-200 dark:border-neutral-800 z-40 pb-safe">
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* FAB & Modals */}
      <FloatingButton
        onAddClick={openAdd}
        onTransferClick={openTransfer}
      />

      {modalHostLoaded && (
        <Suspense fallback={null}>
          <ModalHost
            addOpen={addOpen}
            transferOpen={transferOpen}
            onCloseAdd={() => setAddOpen(false)}
            onCloseTransfer={() => setTransferOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
