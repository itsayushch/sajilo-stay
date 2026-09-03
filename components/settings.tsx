"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HostProfile, getForceOfflineMode, getHostProfile, saveForceOfflineMode } from "@/lib/db";
import { ProfileForm } from "@/components/profile-form";

export function Settings() {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState("Loading settings…");
  const [profile, setProfile] = useState<HostProfile | null | undefined>(undefined);

  useEffect(() => {
    Promise.all([getForceOfflineMode(), getHostProfile()]).then(([saved, savedProfile]) => { setEnabled(saved); setProfile(savedProfile); setStatus(""); }).catch(() => { setStatus("Could not open settings."); setProfile(null); });
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

  return <main className="mx-auto min-h-screen max-w-lg px-4 py-6"><Link href="/" className="text-sm font-bold text-[#1f5d3b]">← Home</Link><header className="mt-6"><h1 className="text-3xl font-bold">Settings</h1><p className="mt-2 text-base leading-6 text-slate-700">Control which AI tier SajiloStay may use.</p></header><section className="mt-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><label className="flex cursor-pointer items-start gap-4"><input type="checkbox" checked={enabled} onChange={toggle} className="mt-1 h-6 w-6 accent-[#1f5d3b]"/><span><span className="block text-lg font-bold">Force offline mode</span><span className="mt-1 block text-sm leading-5 text-slate-700">Skip Groq even when this phone has a connection. On-device AI and offline basics still work.</span></span></label></section><p className="mt-5 text-sm font-medium text-[#1f5d3b]" role="status">{status}</p>{profile ? <section className="mt-8"><h2 className="text-2xl font-bold">Your homestay profile</h2><ProfileForm profile={profile} onSaved={setProfile} submitLabel="Save profile changes" /></section> : profile === null ? <p className="mt-8 text-sm text-slate-700">Complete onboarding from Home to add your homestay profile.</p> : null}</main>;
}
