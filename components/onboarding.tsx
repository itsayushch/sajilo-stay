"use client";

import { HostProfile } from "@/lib/db";
import { ProfileForm } from "@/components/profile-form";

export function Onboarding({ onComplete }: { onComplete: (profile: HostProfile) => void }) {
  return <main className="mx-auto min-h-screen max-w-lg px-4 py-6"><header><p className="mb-1 text-sm font-bold tracking-wide text-[#1f5d3b]">SAJILOSTAY</p><h1 className="text-3xl font-bold">Welcome. Let&apos;s prepare your home.</h1><p className="mt-3 text-base leading-6 text-slate-700">These details stay on this phone and make your listing and price suggestion more useful.</p></header><ProfileForm onSaved={onComplete} submitLabel="Start using SajiloStay" /></main>;
}
