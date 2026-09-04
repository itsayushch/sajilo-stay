"use client";

import { HostProfile } from "@/lib/db";
import { useState } from "react";
import { ProfileForm } from "@/components/profile-form";
import { ConnectionStatus } from "@/components/connection-status";
import { OfflineAiDownload } from "@/components/offline-ai-download";
import type { LanguageCode } from "@/lib/translate";

export function Onboarding({ onComplete }: { onComplete: (profile: HostProfile) => void }) {
  const [savedProfile, setSavedProfile] = useState<HostProfile | null>(null);
  return <main className="site-shell mx-auto min-h-screen max-w-lg px-4 py-6"><ConnectionStatus /><header><p className="mb-2 text-sm font-bold text-[#1f5d3b]">Sajilo Stay · your hosting book</p><h1 className="text-3xl font-bold leading-tight">{savedProfile ? "One last step for offline use." : "Welcome. Let&apos;s prepare your home."}</h1><p className="muted-copy mt-3 text-base leading-6">{savedProfile ? "Download offline AI now, or continue and do it later from Settings." : "These details stay on this phone and make your listing and price suggestion more useful."}</p></header>{savedProfile ? <OfflineAiDownload preferredLanguage={savedProfile.preferredLanguage as LanguageCode} onContinue={() => onComplete(savedProfile)} /> : <ProfileForm onSaved={setSavedProfile} submitLabel="Continue" />}</main>;
}
