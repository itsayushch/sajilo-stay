"use client";

import { useEffect, useState } from "react";

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const updateConnection = () => setIsOnline(navigator.onLine);
    updateConnection();
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
  }, []);

  return <p role="status" className={isOnline ? "fixed right-3 top-3 z-50 inline-flex min-h-9 items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-800 shadow-sm" : "fixed right-3 top-3 z-50 inline-flex min-h-9 items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 text-xs font-bold text-amber-900 shadow-sm"}><span aria-hidden="true" className={isOnline ? "h-2 w-2 rounded-full bg-emerald-600" : "h-2 w-2 rounded-full bg-amber-600"} />{isOnline ? "Online" : "Offline"}</p>;
}
