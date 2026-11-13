import { useState, useEffect, useRef } from "react";

export function usePWAInstall() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const promptRef = useRef(null);

  useEffect(() => {
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (event) => {
      event.preventDefault();
      promptRef.current = event;
      setIsInstallable(true);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      promptRef.current = null;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const installApp = async () => {
    const prompt = promptRef.current;
    if (!prompt) return false;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      const accepted = choice?.outcome === "accepted";
      if (accepted) {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      promptRef.current = null;
      return accepted;
    } catch {
      return false;
    }
  };

  return { isInstallable, isInstalled, installApp };
}
