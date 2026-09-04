"use client";

import { useEffect } from "react";

/** Prevents a newly activated worker from mixing an old document with new chunks. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development" || !("serviceWorker" in navigator)) return;

    let reloading = false;
    const refreshForNewWorker = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", refreshForNewWorker);
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // A failed first registration must not block the offline-capable UI.
    });

    return () => navigator.serviceWorker.removeEventListener("controllerchange", refreshForNewWorker);
  }, []);

  return null;
}
