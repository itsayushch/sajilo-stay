"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HostProfile, getHostProfile, verifyDatabase } from "@/lib/db";
import { Onboarding } from "@/components/onboarding";
import { ConnectionStatus } from "@/components/connection-status";

export function Dashboard() {
  const [profile, setProfile] = useState<HostProfile | null>(null);

  useEffect(() => {
    verifyDatabase()
      .then(getHostProfile)
      .then((savedProfile) => setProfile(savedProfile ?? null))
      .catch((error: unknown) => console.error("Sajilo Stay could not open offline storage.", error));
  }, []);

  if (!profile) return <Onboarding onComplete={setProfile} />;

  return (
    <main className="site-shell mx-auto min-h-screen max-w-lg px-4 py-6 sm:px-5">
      <ConnectionStatus />
      <header className="mb-8 flex items-start justify-between gap-4 pr-24">
        <div>
          <p className="mb-3 inline-flex rounded-full border border-[#b7d7e2] bg-white/80 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#15506d]">Sajilo Stay</p>
          <h1 className="text-3xl font-extrabold leading-tight text-[#162338]">Namaste, {profile.homeName}.</h1>
          <p className="muted-copy mt-2 max-w-sm text-sm leading-6">Your calm, private workspace for every guest stay.</p>
        </div>
        <Link href="/settings" className="mt-1 shrink-0 rounded-lg border border-[#c7dce3] bg-white/85 px-2.5 py-2 text-xs font-extrabold text-[#15506d] shadow-sm hover:border-[#15506d] hover:bg-white focus-visible:ring-2 focus-visible:ring-[#15506d]">Settings</Link>
      </header>

      <nav aria-label="Main sections" className="grid gap-3.5">
        <Link href="/ledger" className="group relative block overflow-hidden rounded-[1.125rem] border border-[#15506d] bg-gradient-to-br from-[#15506d] to-[#0e4962] p-5 text-white shadow-[0_14px_30px_rgba(15,73,98,0.2)] outline-offset-4 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(15,73,98,0.25)] focus-visible:ring-2 focus-visible:ring-[#15506d]">
          <span className="absolute -right-5 -top-7 h-24 w-24 rounded-full bg-white/10" aria-hidden="true" />
          <span className="relative text-xs font-extrabold uppercase tracking-[0.1em] text-[#d8edf4]">Hosting today</span>
          <span className="sign-title relative mt-1 block text-xl font-extrabold">Bookings & cash <span aria-hidden="true" className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span></span>
          <span className="relative mt-2 block max-w-xs text-sm leading-5 text-[#d8edf4]">Keep guest dates, payments, and a shareable ledger in one place.</span>
        </Link>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/listing" className="paper-panel group block min-h-36 p-4 hover:-translate-y-0.5 hover:border-[#94c2d2] focus-visible:ring-2 focus-visible:ring-[#15506d]"><span className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#e2f0f5] text-sm font-extrabold text-[#15506d]" aria-hidden="true">A</span><span className="sign-title block text-lg font-extrabold">Write your stay</span><span className="muted-copy mt-2 block text-xs leading-5">Shape a clear guest listing.</span></Link>
          <Link href="/chat" className="group block min-h-36 rounded-[1.125rem] border border-[#cce3db] bg-[#edf7f2] p-4 shadow-[0_10px_24px_rgba(22,82,67,0.08)] hover:-translate-y-0.5 hover:border-[#8bbba9] focus-visible:ring-2 focus-visible:ring-[#15506d]"><span className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#d3ede1] text-sm font-extrabold text-[#17634d]" aria-hidden="true">↔</span><span className="sign-title block text-lg font-extrabold">Talk to guests</span><span className="muted-copy mt-2 block text-xs leading-5">Practical words across languages.</span></Link>
        </div>
        <Link href="/checklist" className="flex items-center justify-between rounded-xl border border-[#d6e4dd] bg-white/65 px-4 py-3.5 shadow-sm hover:border-[#92b9aa] hover:bg-white focus-visible:ring-2 focus-visible:ring-[#15506d]"><span><span className="sign-title block text-base font-extrabold">Readiness checklist</span><span className="muted-copy mt-1 block text-xs">Make every stay feel prepared.</span></span><span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e4f3ec] text-sm text-[#17634d]">✓</span></Link>
      </nav>
    </main>
  );
}
