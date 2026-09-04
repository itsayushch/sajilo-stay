"use client";

import { useMemo, useState } from "react";
import { downloadListingModel } from "@/lib/listing";
import { LanguageCode, downloadTranslationModels, getTranslationModelPlan, languages } from "@/lib/translate";

export function OfflineAiDownload({ preferredLanguage, onContinue }: { preferredLanguage: LanguageCode; onContinue?: () => void }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const hostLanguage = preferredLanguage === "en" ? "ne" : preferredLanguage;
  const translationModelCount = useMemo(() => new Set([
    ...getTranslationModelPlan(hostLanguage, "en"),
    ...getTranslationModelPlan("en", hostLanguage),
  ]).size, [hostLanguage]);
  const totalSteps = translationModelCount + 1;

  async function hasEnoughStorage() {
    const estimate = await navigator.storage?.estimate?.();
    if (!estimate?.quota || estimate.usage === undefined) return true;
    const remaining = estimate.quota - estimate.usage;
    const requiredBytes = 1_100_000_000;
    if (remaining >= requiredBytes) return true;
    const availableMb = Math.floor(remaining / 1_000_000);
    setStatus(`Offline AI needs about 1.1 GB of free browser storage. This browser reports about ${availableMb} MB available, so the download was not started.`);
    setProgress(null);
    return false;
  }

  async function downloadAll() {
    if (!(await hasEnoughStorage())) return;
    setIsDownloading(true);
    setProgress(0);
    setStatus("Preparing offline AI downloads. Keep this screen open.");
    let completedSteps = 0;
    const updateProgress = (value: number, file?: string) => {
      const nextProgress = Math.round(((completedSteps + value / 100) / totalSteps) * 100);
      setProgress((current) => {
        const stableProgress = Math.max(current ?? 0, nextProgress);
        if (file) setStatus(`Downloading ${file.split("/").pop()}… ${stableProgress}%`);
        return stableProgress;
      });
    };
    try {
      const firstDirection = getTranslationModelPlan(hostLanguage, "en").length;
      if (firstDirection) {
        setStatus(`Downloading ${languages[hostLanguage]} ↔ English translation models…`);
        await downloadTranslationModels(hostLanguage, "en", ({ progress: value, file }) => updateProgress(value, file));
        completedSteps += firstDirection;
      }
      setStatus("Downloading the on-device listing writer…");
      await downloadListingModel(({ progress: value, file }) => updateProgress(value, file));
      setProgress(100);
      setStatus("Offline AI is ready. Translations and listing writing can now work without data.");
    } catch (error) {
      console.error("Sajilo Stay could not download offline AI models.", error);
      const detail = error instanceof Error && error.message ? ` ${error.message}` : "";
      setStatus(`Could not finish the download.${detail} Check your connection and free browser storage, then try again.`);
    } finally {
      setIsDownloading(false);
    }
  }

  return <section className="register-panel mt-6 p-4"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#15506d]">Offline AI</p><h2 className="mt-1 text-xl font-extrabold">Prepare this phone for offline use</h2><p className="muted-copy mt-2 text-sm leading-5">One download prepares English ↔ {languages[hostLanguage]} translation and the guest-ready listing writer. Models are stored in this browser, not added to the app download.</p><p className="mt-2 text-xs font-bold leading-5 text-[#5e7085]">This full offline pack needs about 1.1 GB of free browser storage.</p><button type="button" onClick={downloadAll} disabled={isDownloading} className="mt-4 min-h-10 rounded-lg bg-[#15506d] px-3 text-sm font-extrabold text-white disabled:opacity-60">{isDownloading ? "Downloading offline AI…" : "Download offline AI"}</button>{progress !== null && <div className="mt-4" aria-live="polite"><div className="flex items-center justify-between gap-3 text-xs font-extrabold text-[#15506d]"><span>Download progress</span><span>{progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#dbe9ed]" role="progressbar" aria-label="Offline AI download progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div className="h-full rounded-full bg-[#15506d] transition-[width] duration-200" style={{ width: `${progress}%` }} /></div></div>}{status && <p className="status-line mt-4 rounded-lg border border-[#cfe1da] bg-white/70 px-3 py-2 text-xs font-bold" role="status">{status}</p>}{onContinue && <button type="button" onClick={onContinue} className="mt-3 min-h-10 rounded-lg !border-[#9dbec9] !bg-white px-3 text-sm font-extrabold !text-[#15506d] !shadow-none hover:!bg-[#eef8fb]">Skip for now</button>}</section>;
}
