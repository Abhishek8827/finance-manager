import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { usePWAInstall } from "../hooks/usePWAInstall";
import {
  ChevronDown,
  Pencil,
  LayoutDashboard,
  ListOrdered,
  HandCoins,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Download,
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/", label: "Summary", icon: LayoutDashboard },
  { path: "/entries", label: "Entries", icon: ListOrdered },
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
  const { isInstallable, installApp } = usePWAInstall();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [isDark, setIsDark] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const dark =
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.theme = next ? "dark" : "light";
  };

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Logo — indigo circle + white chart icon (always visible) */}
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm shrink-0 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20"
              viewBox="0 -960 960 960"
              width="20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M320-414v-306h120v306l-60-56-60 56Zm200 60v-526h120v406L520-354ZM120-216v-344h120v224L120-216Zm0 98 258-258 142 122 224-224h-64v-80h200v200h-80v-64L524-146 382-268 232-118H120Z" />
            </svg>
          </div>
          <h1 className="text-base font-bold text-gray-900 dark:text-white hidden lg:block">
            Finance Manager
          </h1>
        </div>

        {/* Account Switcher */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: selectedAccount?.color || "#6366f1" }}
            />
            <span className="truncate max-w-[100px] sm:max-w-none">
              {selectedAccount?.name || "Account"}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl py-2 z-50">
              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                Select Account
              </div>
              {accounts.map((acc) => (
                <div
                  key={acc._id}
                  className="px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  {editingId === acc._id ? (
                    <form
                      className="flex-1 flex gap-1"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (editName.trim())
                          renameAccount(acc._id, editName.trim());
                        setEditingId(null);
                      }}
                    >
                      <input
                        className="input py-1 text-sm flex-1"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                      />
                    </form>
                  ) : (
                    <>
                      <button
                        className="flex-1 text-left text-sm font-medium text-gray-800 dark:text-zinc-100"
                        onClick={() => {
                          switchAccount(acc);
                          setOpen(false);
                        }}
                      >
                        {selectedAccount?._id === acc._id && (
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold mr-1">
                            ✓
                          </span>
                        )}
                        {acc.name}
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded"
                        onClick={() => {
                          setEditingId(acc._id);
                          setEditName(acc.name);
                        }}
                        title="Rename"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              ))}

              <div className="border-t border-gray-100 dark:border-zinc-800 mt-1 pt-1 px-2">
                {adding ? (
                  <form
                    className="flex gap-1 p-1"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (newName.trim()) {
                        await createAccount(newName.trim());
                        setNewName("");
                        setAdding(false);
                      }
                    }}
                  >
                    <input
                      className="input py-1 text-sm flex-1"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Account Name"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="btn-primary text-xs px-2.5"
                    >
                      Add
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setAdding(true)}
                    className="w-full text-xs font-bold text-indigo-600 dark:text-indigo-400 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg text-center"
                  >
                    + Add New Account
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2">
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300"
                      : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-100"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {isInstallable && (
            <button
              onClick={installApp}
              className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Install App"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Install</span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            title="Toggle Dark Mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
