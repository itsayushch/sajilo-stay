"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteListing, getListing, saveListing } from "@/lib/db";
import { ListingTier, PriceBand, generateListingCopy, makeAcceptedListing, suggestPrice } from "@/lib/listing";
import { ConnectionStatus } from "@/components/connection-status";

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
  const [isEditing, setIsEditing] = useState(false);
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
        setIsEditing(false);
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
    setStatus("Writing your listing… The first on-device model download can take a little while.");
    try {
      const result = await generateListingCopy(notes);
      setCopy(result.copy);
      setPrice(result.price);
      setTier(result.tier);
      setAccepted(false);
      setIsEditing(true);
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
      setIsEditing(false);
    } catch {
      setAccepted(false);
      setStatus("Could not save this listing. Please try again.");
    }
  }

  function editListing() {
    setAccepted(false);
    setIsEditing(true);
    setStatus("Edit your notes or description, then generate and save the updated listing.");
  }

  async function removeListing() {
    if (!window.confirm("Delete this saved listing? This cannot be undone.")) return;
    try {
      await deleteListing();
      setNotes("");
      setCopy("");
      setPrice(null);
      setTier(null);
      setAccepted(false);
      setIsEditing(false);
      setStatus("Listing deleted. Add rough notes to create a new one.");
    } catch {
      setStatus("Could not delete this listing. Please try again.");
    }
  }

  async function shareListing() {
    if (!copy || !price) return;
    if (!navigator.share) {
      setStatus("Sharing is not available in this browser. Your accepted listing is still saved offline.");
      return;
    }
    try {
      await navigator.share({ title: "Sajilo Stay homestay", text: `${copy}\n\nFrom ${formatPrice(price.min)} per night.` });
      setStatus("Listing ready to share.");
    } catch {
      setStatus("Sharing was cancelled. Your accepted listing is still saved offline.");
    }
  }

  return (
    <main className="site-shell mx-auto min-h-screen max-w-lg px-4 py-6">
      <ConnectionStatus />
      <Link href="/" className="home-link inline-flex min-h-11 items-center text-sm font-bold">← Back</Link>
      <header className="mt-6"><p className="text-sm font-bold text-[#1f5d3b]">Tell guests about your home</p><h1 className="mt-1 text-3xl font-bold">Write your stay</h1><p className="muted-copy mt-2 text-base leading-6">Turn rough home notes into a guest-ready description—even offline.</p></header>
      {(!accepted || isEditing) && <section className="paper-panel mt-6 p-4"><label className="grid gap-2 text-sm font-bold">Your rough notes<textarea value={notes} onChange={(event) => { setNotes(event.target.value); setAccepted(false); }} rows={6} placeholder="Example: Quiet tea-garden home, two rooms, hot water, breakfast and dinner, mountain view." className="rounded-md border border-[#aebfb5] px-3 py-2" /></label><p className="muted-copy mt-2 text-sm">Mention rooms and facilities to make the price suggestion more accurate.</p><button type="button" onClick={generate} disabled={isGenerating} className="mt-4 min-h-10 rounded-md !bg-[#15506d] px-3 font-bold !text-white disabled:opacity-60">{isGenerating ? "Generating…" : copy ? "Update description and price" : "Generate description and price"}</button></section>}
      {copy && price && <section className="register-panel mt-6 p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#15506d]">Guest-ready listing</p><h2 className="mt-1 text-2xl font-bold">Your stay description</h2></div>{tier && <span className="rounded-md bg-[#d7e6da] px-3 py-1 text-sm font-bold text-[#1f5d3b]">{tierLabel(tier)}</span>}</div>{accepted ? <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#35465b]">{copy}</p> : <textarea value={copy} onChange={(event) => { setCopy(event.target.value); setAccepted(false); }} rows={8} className="mt-4 w-full rounded-md border border-[#aebfb5] px-3 py-2 leading-6" aria-label="Guest-ready description" />}<div className="mt-4 border-l-4 border-[#b97732] bg-[#f3f7f3] p-4"><p className="muted-copy text-sm font-semibold">Suggested nightly price</p><p className="sign-title wood-accent mt-1 text-3xl font-bold">{formatPrice(price.min)}–{formatPrice(price.max)}</p><p className="muted-copy mt-1 text-sm">Based on {price.rooms} room{price.rooms === 1 ? "" : "s"}{price.amenities.length ? ` and ${price.amenities.join(", ")}` : ""}.</p></div><div className="mt-4 flex flex-wrap gap-3">{accepted ? <><button type="button" onClick={editListing} className="min-h-10 rounded-md !border-[#15506d] !bg-white px-3 font-bold !text-[#15506d] !shadow-none hover:!bg-[#eef8fb]">Edit listing</button><button type="button" onClick={shareListing} className="min-h-10 rounded-md !bg-[#15506d] px-3 font-bold !text-white">Share listing</button><button type="button" onClick={removeListing} className="min-h-10 rounded-md !border-red-200 !bg-red-50 px-3 font-bold !text-red-700 !shadow-none hover:!bg-red-100">Delete listing</button></> : <><button type="button" onClick={acceptListing} className="min-h-10 rounded-md !bg-[#15506d] px-3 font-bold !text-white">Save listing</button><button type="button" onClick={shareListing} disabled className="min-h-10 rounded-md !border-[#9dbec9] !bg-white px-3 font-bold !text-[#5e7085] !shadow-none disabled:cursor-not-allowed disabled:opacity-50">Share listing</button></>}</div></section>}
      <p className="status-line mt-5 text-sm font-bold" role="status">{status}</p>
    </main>
  );
}
