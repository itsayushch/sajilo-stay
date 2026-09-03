"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { verifyDatabase } from "@/lib/db";

const destinations = [
  { href: "/listing", title: "Listing", detail: "Describe your home" },
  { href: "/chat", title: "Guest Chat", detail: "Speak across languages" },
  { href: "/ledger", title: "Ledger", detail: "Track bookings and cash" },
  { href: "/checklist", title: "Checklist", detail: "Get ready to host" },
];

export function Dashboard() {
  const [storageStatus, setStorageStatus] = useState("Checking offline storage…");

  useEffect(() => {
    verifyDatabase()
      .then(() => setStorageStatus("Offline storage is ready"))
      .catch(() => setStorageStatus("Offline storage is unavailable in this browser"));
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-6">
      <header className="mb-8">
        <p className="mb-1 text-sm font-bold tracking-wide text-[#1f5d3b]">SAJILOSTAY</p>
        <h1 className="text-3xl font-bold">Your homestay, made simple.</h1>
        <p className="mt-2 text-base leading-6 text-slate-700">An offline helper for garden-village hosts.</p>
      </header>

      <section aria-label="Quick status" className="mb-6 rounded-xl border border-green-200 bg-white p-4 shadow-sm">
        <p className="font-semibold">Start here</p>
        <p className="mt-1 text-sm text-slate-700">No upcoming bookings yet · Listing not started</p>
        <p className="mt-3 text-sm font-medium text-[#1f5d3b]" role="status">{storageStatus}</p>
      </section>

      <nav aria-label="Main sections" className="grid gap-3">
        {destinations.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-xl bg-white p-5 shadow-sm outline-offset-4 ring-1 ring-slate-200 transition hover:ring-[#1f5d3b] focus-visible:ring-2 focus-visible:ring-[#1f5d3b]">
            <span className="block text-lg font-bold">{item.title}</span>
            <span className="mt-1 block text-sm text-slate-700">{item.detail}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
