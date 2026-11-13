import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  Check,
  ChevronDown,
  HandCoins,
  LayoutDashboard,
  ListOrdered,
  Moon,
  Pencil,
  Settings as SettingsIcon,
  Sun,
  Plus,
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import { useTheme } from "../hooks/useTheme";

export const NAV_ITEMS = [
  { path: "/", label: "Overview", icon: LayoutDashboard },
  { path: "/entries", label: "Activity", icon: ListOrdered },
  { path: "/loans", label: "Loans", icon: HandCoins },
  { path: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Header() {
  const {
    accounts,
    selectedAccount,
    switchAccount,
    renameAccount,
    createAccount,
  } = useApp();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const { isDark, setTheme } = useTheme();
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        ref.current?.querySelector("[data-account-trigger]")?.focus();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="19"
              viewBox="0 -960 960 960"
              width="19"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M320-414v-306h120v306l-60-56-60 56Zm200 60v-526h120v406L520-354ZM120-216v-344h120v224L120-216Zm0 98 258-258 142 122 224-224h-64v-80h200v200h-80v-64L524-146 382-268 232-118H120Z" />
            </svg>
          </div>
          <span className="hidden text-[15px] font-bold tracking-tight text-slate-900 dark:text-white sm:block">
            Finance Manager
          </span>
        </div>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
                )
              }
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="relative" ref={ref}>
            <button
              data-account-trigger
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-haspopup="menu"
              aria-controls="account-switcher-menu"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
                style={{ backgroundColor: selectedAccount?.color || "#6366f1" }}
              >
                {(selectedAccount?.name || "A").trim().slice(0, 1).toUpperCase()}
              </span>
              <span className="max-w-[92px] truncate sm:max-w-[140px]">
                {selectedAccount?.name || "Account"}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-slate-400 transition-transform",
                  open && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>

            {open && (
              <div
                id="account-switcher-menu"
                role="menu"
                aria-label="Switch account"
                className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-card dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                  Accounts
                </p>
                <div className="max-h-64 overflow-y-auto">
                  {accounts.map((account) => {
                    const isSelected = selectedAccount?._id === account._id;
                    return (
                      <div
                        key={account._id}
                        className="flex items-center gap-1 rounded-xl px-1 hover:bg-slate-50 dark:hover:bg-zinc-800"
                      >
                        {editingId === account._id ? (
                          <form
                            className="flex flex-1 gap-1 p-1"
                            onSubmit={async (event) => {
                              event.preventDefault();
                              if (!editName.trim()) return;
                              try {
                                await renameAccount(
                                  account._id,
                                  editName.trim(),
                                );
                                setEditingId(null);
                              } catch (error) {
                                toast.error(
                                  error.message || "Couldn’t rename account",
                                );
                              }
                            }}
                          >
                            <input
                              aria-label={`Rename ${account.name}`}
                              className="input h-9 flex-1 py-1 text-sm"
                              value={editName}
                              onChange={(event) =>
                                setEditName(event.target.value)
                              }
                              autoFocus
                            />
                            <button
                              type="submit"
                              className="btn-primary btn-sm px-2.5"
                            >
                              Save
                            </button>
                          </form>
                        ) : (
                          <>
                            <button
                              role="menuitem"
                              className="flex flex-1 items-center gap-2 px-1.5 py-2 text-left text-sm font-medium text-slate-800 dark:text-zinc-100"
                              onClick={() => {
                                switchAccount(account);
                                setOpen(false);
                              }}
                            >
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: account.color }}
                              />
                              <span className="truncate">{account.name}</span>
                              {isSelected && (
                                <Check
                                  className="ml-auto h-4 w-4 text-indigo-600 dark:text-indigo-400"
                                  aria-hidden="true"
                                />
                              )}
                            </button>
                            <button
                              className="icon-btn h-8 w-8"
                              aria-label={`Rename ${account.name}`}
                              onClick={() => {
                                setEditingId(account._id);
                                setEditName(account.name);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-1 border-t border-slate-100 pt-1 dark:border-zinc-800">
                  {adding ? (
                    <form
                      className="flex gap-1 p-1"
                      onSubmit={async (event) => {
                        event.preventDefault();
                        if (!newName.trim()) return;
                        try {
                          await createAccount(newName.trim());
                          setNewName("");
                          setAdding(false);
                        } catch (error) {
                          toast.error(
                            error.message || "Couldn’t create account",
                          );
                        }
                      }}
                    >
                      <input
                        aria-label="New account name"
                        className="input h-9 flex-1 py-1 text-sm"
                        value={newName}
                        onChange={(event) => setNewName(event.target.value)}
                        placeholder="Account name"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="btn-primary btn-sm px-2.5"
                      >
                        Add
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setAdding(true)}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950/40"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Add account
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            aria-pressed={isDark}
            className="icon-btn"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
