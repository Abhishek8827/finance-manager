import { useSyncExternalStore } from "react";

const STORAGE_KEY = "theme";
const listeners = new Set();
const media = () =>
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

function emit() {
  listeners.forEach((listener) => listener());
}

function readStored() {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "light" || value === "dark" ? value : "system";
}

export function getTheme() {
  return readStored();
}

export function resolveDark(theme = readStored()) {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return Boolean(media()?.matches);
}

function apply() {
  const dark = resolveDark();
  document.documentElement.classList.toggle("dark", dark);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? "#09090b" : "#6366f1");
  emit();
}

export function setTheme(theme) {
  if (theme === "system") localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, theme);
  apply();
}

export function initTheme() {
  apply();
  if (typeof window === "undefined") return;
  const mediaQuery = media();
  const onChange = () => {
    if (readStored() === "system") apply();
  };
  if (mediaQuery?.addEventListener) {
    mediaQuery.addEventListener("change", onChange);
  } else {
    mediaQuery?.addListener?.(onChange);
  }
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    () => readStored(),
    () => "system",
  );
  const isDark = useSyncExternalStore(
    subscribe,
    () => resolveDark(),
    () => false,
  );

  return { theme, isDark, setTheme };
}
