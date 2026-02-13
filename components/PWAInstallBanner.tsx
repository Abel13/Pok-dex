"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "pokedex_pwa_install_dismissed";
const DISMISS_DAYS = 7;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function getIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function getWasDismissedRecently(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const timestamp = Number(raw);
    if (Number.isNaN(timestamp)) return false;
    const age = Date.now() - timestamp;
    return age < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function setDismissed(): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

function getIsIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsStandalone(getIsStandalone());
    setIsDismissed(getWasDismissedRecently());
    setIsIOS(getIsIOS());
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!getWasDismissedRecently()) {
        setIsDismissed(false);
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setIsDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const prompt = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsDismissed(true);
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    setDismissed();
  }, []);

  const showBanner =
    !isStandalone && !isDismissed && !isInstalled;

  if (!showBanner) return null;

  const installHint = !deferredPrompt
    ? isIOS
      ? "Toque em Compartilhar (□↑) → Adicionar à Tela de Início"
      : "Use o menu do navegador (⋮) → Instalar aplicativo"
    : null;

  return (
    <div
      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 px-4 py-3 sm:py-2 bg-pokedex-gray/95 border-b border-pokedex-cyan/30 text-sm text-white font-mono"
      role="banner"
      aria-label="Sugestão de instalação do app"
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      <p className="text-pokedex-cyan flex-1 min-w-0">
        Instale o Pokédex para usar como app.
        {installHint && (
          <span className="block mt-1 text-xs text-gray-400">
            {installHint}
          </span>
        )}
      </p>
      <div className="flex items-center gap-2 shrink-0">
        {deferredPrompt && (
          <button
            type="button"
            onClick={prompt}
            aria-label="Instalar aplicativo"
            className="min-h-[44px] px-4 py-2.5 sm:py-2 rounded bg-pokedex-cyan hover:bg-cyan-500 text-black font-bold text-sm sm:text-xs transition-all"
          >
            Instalar
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-pokedex-gray transition-colors"
          aria-label="Fechar"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
