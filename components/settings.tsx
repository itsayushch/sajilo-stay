"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HostProfile, getHostProfile } from "@/lib/db";
import { ProfileForm } from "@/components/profile-form";
import { ConnectionStatus } from "@/components/connection-status";
import { OfflineAiDownload } from "@/components/offline-ai-download";
import type { LanguageCode } from "@/lib/translate";
import { useAppLanguage } from "@/components/app-language";

export function Settings() {
  const { t } = useAppLanguage();
  const [status, setStatus] = useState("Loading settings…");
  const [profile, setProfile] = useState<HostProfile | null | undefined>(undefined);

  useEffect(() => {
    getHostProfile()
      .then((savedProfile) => {
        setProfile(savedProfile);
        setStatus("");
      })
      .catch(() => {
        setStatus("Could not open settings.");
        setProfile(null);
      });
  }, []);

  return (
    <main className="site-shell mx-auto min-h-screen max-w-lg px-4 py-6 sm:px-5">
      <ConnectionStatus />
      <Link href="/" className="home-link inline-flex min-h-11 items-center text-sm font-bold">← {t("Back")}</Link>
      <header className="mt-6"><p className="text-sm font-bold text-[#1f5d3b]">{t("Make the app yours")}</p><h1 className="mt-1 text-3xl font-bold">{t("Settings")}</h1><p className="muted-copy mt-2 text-base leading-6">{t("Sajilo Stay uses online AI when a connection is available and falls back to offline tools when it is not.")}</p></header>
      {profile ? <><OfflineAiDownload preferredLanguage={profile.preferredLanguage as LanguageCode} /><section className="mt-8"><h2 className="text-2xl font-bold">{t("Your homestay profile")}</h2><ProfileForm profile={profile} onSaved={setProfile} submitLabel={t("Save profile changes")} /></section></> : profile === null ? <p className="muted-copy mt-8 text-sm">Complete onboarding from Home to configure offline AI for your preferred language.</p> : null}
      {status && <p className="status-line mt-5 text-sm font-bold" role="status">{status}</p>}
    </main>
  );
}
