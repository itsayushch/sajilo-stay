import type { Listing } from "@/lib/db";

export type ListingTier = "on-device-ai" | "offline-basic";

export interface PriceBand {
  min: number;
  max: number;
  rooms: number;
  amenities: string[];
}

type PromptSession = { prompt(value: string): Promise<string>; destroy?: () => void };
type LanguageModelApi = {
  availability(): Promise<"available" | "downloadable" | "downloading" | "unavailable">;
  create(): Promise<PromptSession>;
};

const chromeLanguageModel = globalThis as typeof globalThis & { LanguageModel?: LanguageModelApi };

function contains(notes: string, terms: string[]) {
  return terms.some((term) => notes.includes(term));
}

export function suggestPrice(notes: string): PriceBand {
  const normalized = notes.toLocaleLowerCase();
  const roomMatch = normalized.match(/(\d+)\s*(room|rooms|कोठा|कमरा|ঘর)/);
  const rooms = Math.max(1, Number(roomMatch?.[1] ?? 1));
  const extras = [
    { name: "attached bathroom", match: ["attached bathroom", "private bathroom", "ensuite"], multiplier: 0.16 },
    { name: "Wi-Fi", match: ["wifi", "wi-fi", "internet"], multiplier: 0.1 },
    { name: "meals", match: ["meal", "breakfast", "dinner", "food"], multiplier: 0.18 },
    { name: "tea-garden view", match: ["view", "tea garden", "mountain"], multiplier: 0.12 },
    { name: "hot water", match: ["hot water", "geyser"], multiplier: 0.08 },
  ].filter((extra) => contains(normalized, extra.match));
  const multiplier = 1 + extras.reduce((total, extra) => total + extra.multiplier, 0);
  const minimum = Math.round((1800 * rooms * multiplier) / 100) * 100;
  return { min: minimum, max: minimum + 500 * rooms, rooms, amenities: extras.map((extra) => extra.name) };
}

function templateCopy(notes: string, price: PriceBand) {
  const detail = notes.trim().replace(/\s+/g, " ");
  const roomLabel = price.rooms === 1 ? "one guest room" : `${price.rooms} guest rooms`;
  const amenityLine = price.amenities.length ? ` Guests can enjoy ${price.amenities.join(", ")}.` : " Guests can enjoy a simple, comfortable local stay.";
  return `Welcome to our family homestay in a Darjeeling tea-garden village. We offer ${roomLabel} for travellers looking for a peaceful hills experience.${amenityLine} ${detail} Stay from ₹${price.min.toLocaleString("en-IN")} per night, with warm local hospitality and clear house guidance for every guest.`;
}

async function generateWithPromptApi(notes: string, price: PriceBand) {
  if (!chromeLanguageModel.LanguageModel) return null;
  const availability = await chromeLanguageModel.LanguageModel.availability();
  if (availability === "unavailable") return null;
  const session = await chromeLanguageModel.LanguageModel.create();
  try {
    return await session.prompt(`Write a warm, accurate 70-word homestay listing in plain English. Do not invent facilities or locations. Mention a Darjeeling tea-garden village, a price band of ₹${price.min}–₹${price.max} per night, and only use these host notes: ${notes}`);
  } finally {
    session.destroy?.();
  }
}

export async function generateListingCopy(notes: string): Promise<{ copy: string; tier: ListingTier; price: PriceBand }> {
  const price = suggestPrice(notes);
  try {
    const copy = await generateWithPromptApi(notes, price);
    if (copy?.trim()) return { copy: copy.trim(), tier: "on-device-ai", price };
  } catch {
    // Gemini Nano may be absent, unsupported, or unable to download on this device.
  }
  return { copy: templateCopy(notes, price), tier: "offline-basic", price };
}

export function makeAcceptedListing(notes: string, copy: string, price: PriceBand): Listing {
  return { id: "primary", rawNotes: notes, generatedCopy: copy, suggestedPriceMin: price.min, suggestedPriceMax: price.max, lastUpdated: new Date().toISOString() };
}
