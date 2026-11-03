import { lazy, Suspense, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Header from "./Header";
import FloatingButton from "./FloatingButton";
import API from "../lib/api";
import { useApp } from "../context/AppContext";
import {
  LayoutDashboard,
  ListOrdered,
  HandCoins,
  Settings,
  StickyNote,
  Trash2,
} from "lucide-react";

const ModalHost = lazy(() => import("./ModalHost"));

const NAV_ITEMS = [
  { path: "/", label: "Summary", icon: LayoutDashboard },
  { path: "/entries", label: "Entries", icon: ListOrdered },
  { path: "/loans", label: "Loans", icon: HandCoins },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Layout({ children }) {
  const { selectedAccount } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [modalHostLoaded, setModalHostLoaded] = useState(false);
  const [note, setNote] = useState("");
  const [noteLoadedAccount, setNoteLoadedAccount] = useState(null);

  useEffect(() => {
    setNote(selectedAccount?.note || "");
    setNoteLoadedAccount(selectedAccount?._id || null);
  }, [selectedAccount]);

  useEffect(() => {
    if (!selectedAccount?._id || noteLoadedAccount !== selectedAccount._id)
      return;
    const timeout = window.setTimeout(() => {
      API.put(`/accounts/${selectedAccount._id}/note`, { note }).catch(
        () => {},
      );
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [note, noteLoadedAccount, selectedAccount]);

  const clearNote = () => {
    setNote("");
  };

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

      <aside
        className="hidden 2xl:block fixed left-5 top-24 z-30 w-64"
        aria-label="Quick note"
      >
        <div className="card overflow-hidden shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-zinc-200">
              <StickyNote
                className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
                aria-hidden="true"
              />
              Quick note
            </div>
            <button
              type="button"
              onClick={clearNote}
              disabled={!note}
              className="flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-red-600 disabled:cursor-default disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800"
              aria-label="Clear note"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear
            </button>
          </div>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Write a note..."
            aria-label="Quick note"
            className="input min-h-48 resize-y rounded-none border-0 bg-white leading-6 dark:bg-zinc-900"
          />
        </div>
      </aside>

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6"
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Mobile navigation"
        className="sm:hidden fixed bottom-0 inset-x-0 glass border-t border-gray-200 dark:border-neutral-800 z-40 pb-safe"
      >
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
      <FloatingButton onAddClick={openAdd} onTransferClick={openTransfer} />

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
