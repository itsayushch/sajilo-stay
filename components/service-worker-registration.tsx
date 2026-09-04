"use client";

import { useEffect } from "react";

/** Registers the offline worker without interrupting an in-progress app startup. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // A failed first registration must not block the offline-capable UI.
    });
  }, []);

  return null;
}
