"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    let refreshing = false;

    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    const registerAndUpdate = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        // Force an update check so clients don't wait up to 24h.
        await registration.update();

        // If a new worker is already waiting (previous visit), activate it.
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener("statechange", () => {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New version ready; skipWaiting already runs in sw.js install.
              // Reload is handled by controllerchange.
            }
          });
        });
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        navigator.serviceWorker.getRegistration().then((registration) => {
          registration?.update();
        });
      }
    };

    if (document.readyState === "complete") {
      registerAndUpdate();
    } else {
      window.addEventListener("load", registerAndUpdate, { once: true });
    }

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
