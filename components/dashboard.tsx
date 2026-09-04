"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HostProfile, getHostProfile, verifyDatabase } from "@/lib/db";
import { Onboarding } from "@/components/onboarding";

export function Dashboard() {
  const [storageStatus, setStorageStatus] = useState("Checking offline storage…");
  const [profile, setProfile] = useState<HostProfile | null | undefined>(undefined);

  useEffect(() => {
    const storageTimeout = window.setTimeout(() => {
      setStorageStatus("Offline storage is taking too long. You can try again after restarting the app.");
      setProfile((current) => current === undefined ? null : current);
    }, 2_000);
    verifyDatabase()
      .then(getHostProfile)
      .then((savedProfile) => { setStorageStatus("Offline storage is ready"); setProfile(savedProfile); })
      .catch(() => { setStorageStatus("Offline storage is unavailable in this browser"); setProfile(null); })
      .finally(() => window.clearTimeout(storageTimeout));
    return () => window.clearTimeout(storageTimeout);
  }, []);

  if (profile === undefined) return <main className="site-shell mx-auto min-h-screen max-w-lg px-4 py-6"><p className="text-base font-semibold text-[#1f5d3b]">Preparing SajiloStay…</p></main>;
  if (!profile) return <Onboarding onComplete={setProfile} />;

  return (
    <main className="site-shell mx-auto min-h-screen max-w-lg px-4 py-6">
      <header className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-bold text-[#1f5d3b]">SajiloStay · your hosting book</p>
          <h1 className="text-4xl font-bold leading-tight">Namaste, {profile.homeName}.</h1>
          <p className="muted-copy mt-2 text-base leading-6">A quiet helper for your garden-village home.</p>
        </div>
        <Link href="/settings" className="home-link mt-1 shrink-0 text-sm font-bold">Settings</Link>
      </header>

      <section aria-label="Quick status" className="paper-panel mb-6 p-4">
        <p className="sign-title text-xl font-bold">Today at your homestay</p>
        <div className="mt-3 border-t border-[#b9ccc0] pt-3">
          <p className="muted-copy text-sm">Open your hosting book whenever a guest calls or a stay is confirmed.</p>
          <p className="status-line mt-3 text-sm font-bold" role="status">{storageStatus}</p>
        </div>
      </section>

      <nav aria-label="Main sections" className="grid gap-3">
        <Link href="/ledger" className="register-panel block p-5 outline-offset-4 hover:border-[#1f5d3b] focus-visible:ring-2 focus-visible:ring-[#1f5d3b]">
          <span className="wood-accent text-sm font-bold">Hosting today</span>
          <span className="sign-title mt-1 block text-2xl font-bold">Bookings & cash</span>
          <span className="muted-copy mt-2 block text-sm leading-5">Keep guest dates, payments, and a shareable ledger in one place.</span>
        </Link>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/listing" className="paper-panel block min-h-36 p-4 hover:border-[#1f5d3b] focus-visible:ring-2 focus-visible:ring-[#1f5d3b]"><span className="sign-title block text-xl font-bold">Write your stay</span><span className="muted-copy mt-2 block text-sm leading-5">Shape a clear guest listing.</span></Link>
          <Link href="/chat" className="border-b-4 border-[#1f5d3b] bg-[#d7e6da] p-4 hover:bg-[#c9ddce] focus-visible:ring-2 focus-visible:ring-[#1f5d3b]"><span className="sign-title block text-xl font-bold">Talk to guests</span><span className="muted-copy mt-2 block text-sm leading-5">Practical words across languages.</span></Link>
        </div>
        <Link href="/checklist" className="flex items-center justify-between border-y border-[#aebfb5] py-4 hover:text-[#1f5d3b] focus-visible:ring-2 focus-visible:ring-[#1f5d3b]"><span><span className="sign-title block text-xl font-bold">Readiness checklist</span><span className="muted-copy mt-1 block text-sm">Make every stay feel prepared.</span></span><span aria-hidden="true" className="wood-accent text-xl">●</span></Link>
      </nav>
    </main>
  );
}
