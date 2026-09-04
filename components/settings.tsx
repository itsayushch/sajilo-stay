"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HostProfile, getForceOfflineMode, getHostProfile, saveForceOfflineMode } from "@/lib/db";
import { ProfileForm } from "@/components/profile-form";
import { ConnectionStatus } from "@/components/connection-status";
import { LanguageCode, downloadTranslationModels, getTranslationModelPlan, languages } from "@/lib/translate";
import { downloadListingModel } from "@/lib/listing";

export function Settings() {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState("Loading settings…");
  const [profile, setProfile] = useState<HostProfile | null | undefined>(undefined);
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>("ne");
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>("en");
  const [downloadStatus, setDownloadStatus] = useState("");
  const [isDownloadingTranslation, setIsDownloadingTranslation] = useState(false);
  const [isDownloadingListing, setIsDownloadingListing] = useState(false);

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

  async function downloadTranslation() {
    const modelCount = getTranslationModelPlan(sourceLanguage, targetLanguage).length;
    if (!modelCount) {
      setDownloadStatus("Choose two different supported languages.");
      return;
    }
    setIsDownloadingTranslation(true);
    setDownloadStatus(`Downloading ${modelCount === 1 ? "the translation model" : "two translation models"}. Keep this screen open until it finishes.`);
    try {
      await downloadTranslationModels(sourceLanguage, targetLanguage);
      setDownloadStatus(`Downloaded ${modelCount === 1 ? "the translation model" : "both translation models"}. This pair now works offline.`);
    } catch (error) {
      console.error("Sajilo Stay could not download translation models.", error);
      setDownloadStatus("Could not download the translation model. Check your connection and free storage, then try again.");
    } finally {
      setIsDownloadingTranslation(false);
    }
  }

  async function downloadListingWriter() {
    setIsDownloadingListing(true);
    setDownloadStatus("Downloading the on-device listing writer. This is a larger one-time download; keep this screen open.");
    try {
      await downloadListingModel();
      setDownloadStatus("The on-device listing writer is ready for offline use.");
    } catch (error) {
      console.error("Sajilo Stay could not download the listing writer.", error);
      setDownloadStatus("Could not download the listing writer. Check your connection and free storage, then try again.");
    } finally {
      setIsDownloadingListing(false);
    }
  }

  const modelCount = getTranslationModelPlan(sourceLanguage, targetLanguage).length;

  return (
    <main className="site-shell mx-auto min-h-screen max-w-lg px-4 py-6 sm:px-5">
      <ConnectionStatus />
      <Link href="/" className="home-link inline-flex min-h-11 items-center text-sm font-bold">← Back</Link>
      <header className="mt-6"><p className="text-sm font-bold text-[#1f5d3b]">Make the app yours</p><h1 className="mt-1 text-3xl font-bold">Settings</h1><p className="muted-copy mt-2 text-base leading-6">Choose how Sajilo Stay uses online and offline AI.</p></header>
      <section className="paper-panel mt-6 p-4"><label className="flex cursor-pointer items-start gap-4"><input type="checkbox" checked={enabled} onChange={toggle} className="mt-1 h-6 w-6 accent-[#1f5d3b]"/><span><span className="sign-title block text-xl font-bold">Force offline mode</span><span className="muted-copy mt-1 block text-sm leading-5">Skip online AI. Downloaded on-device models and offline basics still work.</span></span></label></section>
      <section className="register-panel mt-5 p-4"><div><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#15506d]">Offline AI downloads</p><h2 className="mt-1 text-xl font-extrabold">Prepare this phone for offline use</h2><p className="muted-copy mt-2 text-sm leading-5">Models download once to this browser&apos;s storage. They are not included in the app download.</p></div><div className="mt-5 grid grid-cols-2 gap-3"><label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-[0.08em] text-[#5e7085]">From<select value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value as LanguageCode)} className="min-h-10 rounded-lg border-[#c9d9df] bg-white px-2.5 text-sm font-bold text-[#162338]">{Object.entries(languages).map(([code, language]) => <option key={code} value={code}>{language}</option>)}</select></label><label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-[0.08em] text-[#5e7085]">To<select value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value as LanguageCode)} className="min-h-10 rounded-lg border-[#c9d9df] bg-white px-2.5 text-sm font-bold text-[#162338]">{Object.entries(languages).map(([code, language]) => <option key={code} value={code}>{language}</option>)}</select></label></div><p className="muted-copy mt-3 text-xs leading-5">{modelCount === 2 ? "This pair uses two English-bridge models." : modelCount === 1 ? "This pair uses one on-device translation model." : "Choose two different languages to download a model."}</p><button type="button" onClick={downloadTranslation} disabled={isDownloadingTranslation || !modelCount} className="mt-3 min-h-10 rounded-lg bg-[#15506d] px-3 text-sm font-extrabold text-white disabled:opacity-60">{isDownloadingTranslation ? "Downloading translation model…" : "Download translation model"}</button><div className="mt-5 border-t border-[#dce8e8] pt-4"><h3 className="text-base font-extrabold">On-device listing writer</h3><p className="muted-copy mt-1 text-xs leading-5">A compact, cached writer for turning rough notes into a guest-ready English listing. The initial download is about 117 MB.</p><button type="button" onClick={downloadListingWriter} disabled={isDownloadingListing} className="mt-3 min-h-10 rounded-lg !border-[#9dbec9] !bg-white px-3 text-sm font-extrabold !text-[#15506d] !shadow-none hover:!bg-[#eef8fb] disabled:opacity-60">{isDownloadingListing ? "Downloading listing writer…" : "Download listing writer"}</button></div>{downloadStatus && <p className="status-line mt-4 rounded-lg border border-[#cfe1da] bg-white/70 px-3 py-2 text-xs font-bold" role="status">{downloadStatus}</p>}</section>
      {status && <p className="status-line mt-5 text-sm font-bold" role="status">{status}</p>}
      {profile ? <section className="mt-8"><h2 className="text-2xl font-bold">Your homestay profile</h2><ProfileForm profile={profile} onSaved={setProfile} submitLabel="Save profile changes" /></section> : profile === null ? <p className="muted-copy mt-8 text-sm">Complete onboarding from Home to add your homestay profile.</p> : null}
    </main>
  );
}
