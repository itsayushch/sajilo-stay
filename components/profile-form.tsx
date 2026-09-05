"use client";

import { FormEvent, useState } from "react";
import { HostProfile, saveHostProfile } from "@/lib/db";

const amenities = ["Hot water", "Wi-Fi", "Meals", "Attached bathroom", "Tea-garden view"];

export function ProfileForm({ profile, onSaved, submitLabel = "Save profile" }: { profile?: HostProfile; onSaved?: (profile: HostProfile) => void; submitLabel?: string }) {
  const [homeName, setHomeName] = useState(profile?.homeName ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [rooms, setRooms] = useState(profile?.rooms ?? 1);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(profile?.amenities ?? []);
  const [preferredLanguage, setPreferredLanguage] = useState(profile?.preferredLanguage ?? "ne");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleAmenity(amenity: string) {
    setSelectedAmenities((current) => current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!homeName.trim() || !location.trim() || rooms < 1) {
      setStatus("Please add your home name, location, and room count.");
      return;
    }
    const nextProfile: HostProfile = { id: "primary", homeName: homeName.trim(), location: location.trim(), rooms, amenities: selectedAmenities, preferredLanguage };
    setSaving(true);
    setStatus("Saving on this phone…");
    try {
      await saveHostProfile(nextProfile);
      setStatus("Profile saved offline.");
      onSaved?.(nextProfile);
    } catch {
      setStatus("Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return <form onSubmit={submit} className="paper-panel mt-6 grid gap-4 p-4"><label className="grid gap-1 text-base font-bold">Home name<input required value={homeName} onChange={(event) => setHomeName(event.target.value)} placeholder="e.g. Aama's Tea Garden Stay" className="min-h-12 rounded-md border border-[#aebfb5] px-3" /></label><label className="grid gap-1 text-base font-bold">Village or location<input required value={location} onChange={(event) => setLocation(event.target.value)} placeholder="e.g. Happy Valley, Darjeeling" className="min-h-12 rounded-md border border-[#aebfb5] px-3" /></label><label className="grid gap-1 text-base font-bold">Guest rooms<input required min="1" max="20" type="number" inputMode="numeric" value={rooms} onChange={(event) => setRooms(Number(event.target.value))} className="min-h-12 rounded-md border border-[#aebfb5] px-3" /></label><fieldset><legend className="text-base font-bold">What can guests use?</legend><div className="mt-2 grid gap-2">{amenities.map((amenity) => <label key={amenity} className="flex min-h-11 items-center gap-3 text-base"><input type="checkbox" checked={selectedAmenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} className="h-6 w-6 accent-[#1f5d3b]" />{amenity}</label>)}</div></fieldset><label className="grid gap-1 text-base font-bold">App language<select value={preferredLanguage === "ne" ? "ne" : "en"} onChange={(event) => setPreferredLanguage(event.target.value)} className="min-h-12 rounded-md border border-[#aebfb5] px-3"><option value="en">English</option><option value="ne">Nepali</option></select></label><button type="submit" disabled={saving} className="min-h-10 rounded-md bg-[#1f5d3b] px-3 text-sm font-bold text-white disabled:opacity-60">{saving ? "Saving…" : submitLabel}</button><p className="status-line text-sm font-bold" role="status">{status}</p></form>;
}
