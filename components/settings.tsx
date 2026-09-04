"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HostProfile, getForceOfflineMode, getHostProfile, saveForceOfflineMode } from "@/lib/db";
import { ProfileForm } from "@/components/profile-form";
import { ConnectionStatus } from "@/components/connection-status";
import { OfflineAiDownload } from "@/components/offline-ai-download";
import type { LanguageCode } from "@/lib/translate";

export function Settings() {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState("Loading settings…");
  const [profile, setProfile] = useState<HostProfile | null | undefined>(undefined);

  useEffect(() => {
    Promise.all([getForceOfflineMode(), getHostProfile()])
      .then(([saved, savedProfile]) => {
        setEnabled(saved);
        setProfile(savedProfile);
        setStatus("");
      })
      .catch(() => {
        setStatus("Could not open settings.");
        setProfile(null);
      });
  }, []);

  async function toggle() {
    const next = !enabled;
    setEnabled(next);
    setStatus(next ? "Force offline mode is on. Online AI will not be contacted." : "Online AI can be used when available.");
    try {
      await saveForceOfflineMode(next);
    } catch {
      setEnabled(!next);
      setStatus("Could not save this setting. Please try again.");
    }
  }

  return (
    <main className="site-shell mx-auto min-h-screen max-w-lg px-4 py-6 sm:px-5">
      <ConnectionStatus />
      <Link href="/" className="home-link inline-flex min-h-11 items-center text-sm font-bold">← Back</Link>
      <header className="mt-6"><p className="text-sm font-bold text-[#1f5d3b]">Make the app yours</p><h1 className="mt-1 text-3xl font-bold">Settings</h1><p className="muted-copy mt-2 text-base leading-6">Choose how Sajilo Stay uses online and offline AI.</p></header>
      <section className="paper-panel mt-6 p-4"><label className="flex cursor-pointer items-start gap-4"><input type="checkbox" checked={enabled} onChange={toggle} className="mt-1 h-6 w-6 accent-[#1f5d3b]"/><span><span className="sign-title block text-xl font-bold">Force offline mode</span><span className="muted-copy mt-1 block text-sm leading-5">Skip online AI. Downloaded on-device models and offline basics still work.</span></span></label></section>
      {profile ? <><OfflineAiDownload preferredLanguage={profile.preferredLanguage as LanguageCode} /><section className="mt-8"><h2 className="text-2xl font-bold">Your homestay profile</h2><ProfileForm profile={profile} onSaved={setProfile} submitLabel="Save profile changes" /></section></> : profile === null ? <p className="muted-copy mt-8 text-sm">Complete onboarding from Home to configure offline AI for your preferred language.</p> : null}
      {status && <p className="status-line mt-5 text-sm font-bold" role="status">{status}</p>}
    </main>
  );
}
