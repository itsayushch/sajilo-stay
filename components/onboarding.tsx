"use client";

import { HostProfile } from "@/lib/db";
import { ProfileForm } from "@/components/profile-form";
import { ConnectionStatus } from "@/components/connection-status";

export function Onboarding({ onComplete }: { onComplete: (profile: HostProfile) => void }) {
  return <main className="site-shell mx-auto min-h-screen max-w-lg px-4 py-6"><ConnectionStatus /><header><p className="mb-2 text-sm font-bold text-[#1f5d3b]">Sajilo Stay · your hosting book</p><h1 className="text-3xl font-bold leading-tight">Welcome. Let&apos;s prepare your home.</h1><p className="muted-copy mt-3 text-base leading-6">These details stay on this phone and make your listing and price suggestion more useful.</p></header><ProfileForm onSaved={onComplete} submitLabel="Start using Sajilo Stay" /></main>;
}
