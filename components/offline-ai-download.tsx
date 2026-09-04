"use client";

import { useState } from "react";
import { downloadListingModel } from "@/lib/listing";
import { LanguageCode } from "@/lib/translate";

export function OfflineAiDownload({ onContinue }: { preferredLanguage: LanguageCode; onContinue?: () => void }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  async function hasEnoughStorage() {
    const estimate = await navigator.storage?.estimate?.();
    if (!estimate?.quota || estimate.usage === undefined) return true;
    const remaining = estimate.quota - estimate.usage;
    const requiredBytes = 180_000_000;
    if (remaining >= requiredBytes) return true;
    const availableMb = Math.floor(remaining / 1_000_000);
    setStatus(`Lite offline AI needs about 180 MB of free browser storage. This browser reports about ${availableMb} MB available, so the download was not started.`);
    setProgress(null);
    return false;
  }

  async function downloadAll() {
    if (!(await hasEnoughStorage())) return;
    setIsDownloading(true);
    setProgress(0);
    setStatus("Preparing the Lite offline AI download. Keep this screen open.");
    const updateProgress = (value: number, file?: string) => {
      const nextProgress = Math.round(value);
      setProgress((current) => {
        const stableProgress = Math.max(current ?? 0, nextProgress);
        if (file) setStatus(`Downloading ${file.split("/").pop()}… ${stableProgress}%`);
        return stableProgress;
      });
    };
    try {
      setStatus("Downloading the on-device listing writer…");
      await downloadListingModel(({ progress: value, file }) => updateProgress(value, file));
      setProgress(100);
      setStatus("Lite offline AI is ready. Listing writing can now work without data.");
    } catch (error) {
      console.error("Sajilo Stay could not download offline AI models.", error);
      const detail = error instanceof Error && error.message ? ` ${error.message}` : "";
      setStatus(`Could not finish the download.${detail} Check your connection and free browser storage, then try again.`);
    } finally {
      setIsDownloading(false);
    }
  }

  return <section className="register-panel mt-6 p-4"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#15506d]">Lite offline AI</p><h2 className="mt-1 text-xl font-extrabold">Write listings without data</h2><p className="muted-copy mt-2 text-sm leading-5">Download a compact on-device listing writer. It helps turn your notes into guest-ready copy while offline, without adding a large translation model to this phone.</p><p className="mt-2 text-xs font-bold leading-5 text-[#5e7085]">Needs about 180 MB of free browser storage. Guest message translation uses online AI when connected; saved quick phrases still work offline.</p><button type="button" onClick={downloadAll} disabled={isDownloading} className="mt-4 min-h-10 rounded-lg bg-[#15506d] px-3 text-sm font-extrabold text-white disabled:opacity-60">{isDownloading ? "Downloading Lite AI…" : "Download Lite offline AI"}</button>{progress !== null && <div className="mt-4" aria-live="polite"><div className="flex items-center justify-between gap-3 text-xs font-extrabold text-[#15506d]"><span>Download progress</span><span>{progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#dbe9ed]" role="progressbar" aria-label="Lite offline AI download progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div className="h-full rounded-full bg-[#15506d] transition-[width] duration-200" style={{ width: `${progress}%` }} /></div></div>}{status && <p className="status-line mt-4 rounded-lg border border-[#cfe1da] bg-white/70 px-3 py-2 text-xs font-bold" role="status">{status}</p>}{onContinue && <button type="button" onClick={onContinue} className="mt-3 min-h-10 rounded-lg !border-[#9dbec9] !bg-white px-3 text-sm font-extrabold !text-[#15506d] !shadow-none hover:!bg-[#eef8fb]">Skip for now</button>}</section>;
}
