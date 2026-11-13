import { lazy, Suspense, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Header, { NAV_ITEMS } from "./Header";
import FloatingButton from "./FloatingButton";
import RouteChrome from "./RouteChrome";
import NoteButton from "./NoteButton";
import NoteModal from "./NoteModal";
import API from "../lib/api";
import { useApp } from "../context/AppContext";
import { onQuickActions } from "../lib/quickActions";
import { cn } from "../lib/utils";
import { StickyNote, Trash2 } from "lucide-react";

const ModalHost = lazy(() => import("./ModalHost"));

export default function Layout({ children }) {
  const { selectedAccount } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [modalHostLoaded, setModalHostLoaded] = useState(false);
  const [note, setNote] = useState("");
  const [noteLoadedAccount, setNoteLoadedAccount] = useState(null);
  const [noteOpen, setNoteOpen] = useState(false);

  useEffect(() => {
    setNote(selectedAccount?.note || "");
    setNoteLoadedAccount(selectedAccount?._id || null);
    setNoteOpen(false);
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

  const openAdd = () => {
    setModalHostLoaded(true);
    setAddOpen(true);
  };
  const openTransfer = () => {
    setModalHostLoaded(true);
    setTransferOpen(true);
  };

  useEffect(
    () => onQuickActions({ add: openAdd, transfer: openTransfer }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 transition-colors duration-200 dark:bg-zinc-950">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-indigo-700"
      >
        Skip to main content
      </a>

      <Header />
      <RouteChrome />

      <aside
        className="fixed left-5 top-24 z-30 hidden w-64 2xl:block"
        aria-label="Quick note"
      >
        <div className="card overflow-hidden">
          <div className="card-head py-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-zinc-300">
              <StickyNote
                className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
                aria-hidden="true"
              />
              Quick note
            </div>
            <button
              type="button"
              onClick={() => setNote("")}
              disabled={!note}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-rose-600 disabled:cursor-default disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800"
              aria-label="Clear note"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </button>
          </div>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            onBlur={() =>
              selectedAccount?._id &&
              API.put(`/accounts/${selectedAccount._id}/note`, { note }).catch(
                () => {},
              )
            }
            placeholder="Jot down a reminder, a bill to pay, or an idea…"
            aria-label="Quick note"
            className="min-h-48 w-full resize-y border-0 bg-transparent p-4 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400 dark:text-zinc-200 dark:placeholder:text-zinc-500"
          />
        </div>
      </aside>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-5 outline-none sm:px-6 sm:pb-12 sm:pt-6"
      >
        {children}
        <p className="mt-10 hidden text-center text-[11px] text-slate-400 dark:text-zinc-600 sm:block">
          Finance Manager · private ledger for {selectedAccount?.name || "you"}
        </p>
      </main>

      <nav
        aria-label="Mobile navigation"
        className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/90 sm:hidden"
      >
        <div className="mx-auto flex h-[68px] max-w-md items-stretch justify-around px-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold transition-colors",
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-200",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                      isActive && "bg-indigo-50 dark:bg-indigo-950/60",
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <NoteButton
        onClick={() => setNoteOpen(true)}
        hasNote={Boolean(note.trim())}
      />

      <FloatingButton onAddClick={openAdd} onTransferClick={openTransfer} />

      <NoteModal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        note={note}
        onChange={setNote}
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
