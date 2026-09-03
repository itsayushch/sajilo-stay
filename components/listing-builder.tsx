"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getListing, saveListing } from "@/lib/db";
import { ListingTier, PriceBand, generateListingCopy, makeAcceptedListing, suggestPrice } from "@/lib/listing";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function tierLabel(tier: ListingTier) {
  return tier === "online-ai" ? "Online AI" : tier === "on-device-ai" ? "On-device AI" : "Offline basic";
}

export function ListingBuilder() {
  const [notes, setNotes] = useState("");
  const [copy, setCopy] = useState("");
  const [price, setPrice] = useState<PriceBand | null>(null);
  const [tier, setTier] = useState<ListingTier | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [status, setStatus] = useState("Loading saved listing…");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    getListing()
      .then((saved) => {
        if (!saved) {
          setStatus("Add rough notes in any language. A template always works offline.");
          return;
        }
        setNotes(saved.rawNotes);
        setCopy(saved.generatedCopy);
        const savedBasis = suggestPrice(saved.rawNotes);
        setPrice({ ...savedBasis, min: saved.suggestedPriceMin, max: saved.suggestedPriceMax });
        setAccepted(true);
        setStatus("Accepted listing saved on this phone.");
      })
      .catch(() => setStatus("Could not open your saved listing. Please try again."));
  }, []);

  async function generate() {
    if (!notes.trim()) {
      setStatus("Add a few notes about your home first.");
      return;
    }
    setIsGenerating(true);
    setStatus("Writing your listing on this device…");
    try {
      const result = await generateListingCopy(notes);
      setCopy(result.copy);
      setPrice(result.price);
      setTier(result.tier);
      setAccepted(false);
      setStatus(`${tierLabel(result.tier)} · review and accept the listing when it feels right.`);
    } catch {
      setStatus("Could not create a listing right now. Please try again or use shorter notes.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function acceptListing() {
    if (!copy || !price) return;
    const listing = makeAcceptedListing(notes, copy, price);
    setAccepted(true);
    setStatus("Listing accepted and saved offline.");
    try {
      await saveListing(listing);
    } catch {
      setAccepted(false);
      setStatus("Could not save this listing. Please try again.");
    }
  }

  async function shareListing() {
    if (!copy || !price) return;
    if (!navigator.share) {
      setStatus("Sharing is not available in this browser. Your accepted listing is still saved offline.");
      return;
    }
    try {
      await navigator.share({ title: "SajiloStay homestay", text: `${copy}\n\nFrom ${formatPrice(price.min)} per night.` });
      setStatus("Listing ready to share.");
    } catch {
      setStatus("Sharing was cancelled. Your accepted listing is still saved offline.");
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-6">
      <Link href="/" className="text-sm font-bold text-[#1f5d3b]">← Home</Link>
      <header className="mt-6"><h1 className="text-3xl font-bold">Listing Builder</h1><p className="mt-2 text-base leading-6 text-slate-700">Turn rough home notes into a guest-ready description—even offline.</p></header>
      <section className="mt-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><label className="grid gap-2 text-sm font-bold">Your rough notes<textarea value={notes} onChange={(event) => { setNotes(event.target.value); setAccepted(false); }} rows={6} placeholder="Example: Quiet tea-garden home, two rooms, hot water, breakfast and dinner, mountain view." className="rounded-lg border border-slate-300 px-3 py-2" /></label><p className="mt-2 text-sm text-slate-700">Mention rooms and facilities to make the price suggestion more accurate.</p><button type="button" onClick={generate} disabled={isGenerating} className="mt-4 min-h-12 rounded-lg bg-[#1f5d3b] px-4 font-bold text-white disabled:opacity-60">{isGenerating ? "Generating…" : "Generate listing"}</button></section>
      {copy && price && <section className="mt-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">Your listing</h2>{tier && <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-[#1f5d3b]">{tierLabel(tier)}</span>}</div><textarea value={copy} onChange={(event) => { setCopy(event.target.value); setAccepted(false); }} rows={8} className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 leading-6" aria-label="Generated listing" /><div className="mt-4 rounded-lg bg-[#f4f7f1] p-4"><p className="text-sm font-semibold text-slate-700">Suggested total nightly price</p><p className="mt-1 text-2xl font-bold">{formatPrice(price.min)}–{formatPrice(price.max)}</p><p className="mt-1 text-sm text-slate-700">Based on {price.rooms} room{price.rooms === 1 ? "" : "s"}{price.amenities.length ? ` and ${price.amenities.join(", ")}` : ""}.</p></div><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={acceptListing} className="min-h-12 rounded-lg bg-[#1f5d3b] px-4 font-bold text-white">{accepted ? "Saved" : "Accept listing"}</button><button type="button" onClick={shareListing} disabled={!accepted} className="min-h-12 rounded-lg border border-[#1f5d3b] px-4 font-bold text-[#1f5d3b] disabled:cursor-not-allowed disabled:opacity-50">Share listing</button></div></section>}
      <p className="mt-5 text-sm font-medium text-[#1f5d3b]" role="status">{status}</p>
    </main>
  );
}
