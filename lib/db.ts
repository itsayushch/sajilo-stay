import { DBSchema, IDBPDatabase, openDB } from "idb";

export type BookingStatus = "pending" | "paid";

export interface SajiloStayDB extends DBSchema {
  host_profile: {
    key: string;
    value: { id: string; homeName: string; location: string; rooms: number; amenities: string[]; preferredLanguage: string };
  };
  listing: {
    key: string;
    value: { id: string; rawNotes: string; generatedCopy: string; suggestedPriceMin: number; suggestedPriceMax: number; lastUpdated: string };
  };
  bookings: {
    key: string;
    value: { id: string; guestName: string; checkIn: string; checkOut: string; amount: number; status: BookingStatus; notes: string };
    indexes: { "by-check-in": string };
  };
  messages: {
    key: string;
    value: { id: string; originalText: string; originalLang: string; translatedText: string; translatedLang: string; timestamp: string };
    indexes: { "by-timestamp": string };
  };
  checklist_state: {
    key: string;
    value: { itemId: string; checked: boolean };
  };
}

let databasePromise: Promise<IDBPDatabase<SajiloStayDB>> | undefined;

export function getDatabase() {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser.");
  }

  databasePromise ??= openDB<SajiloStayDB>("sajilo-stay", 1, {
    upgrade(database) {
      database.createObjectStore("host_profile", { keyPath: "id" });
      database.createObjectStore("listing", { keyPath: "id" });
      const bookings = database.createObjectStore("bookings", { keyPath: "id" });
      bookings.createIndex("by-check-in", "checkIn");
      const messages = database.createObjectStore("messages", { keyPath: "id" });
      messages.createIndex("by-timestamp", "timestamp");
      database.createObjectStore("checklist_state", { keyPath: "itemId" });
    },
  });

  return databasePromise;
}

/** Confirms IndexedDB can persist structured data without leaving seed content behind. */
export async function verifyDatabase() {
  const database = await getDatabase();
  const probe = {
    id: "__m1_storage_probe__",
    homeName: "",
    location: "",
    rooms: 0,
    amenities: [],
    preferredLanguage: "",
  };

  await database.put("host_profile", probe);
  const savedProbe = await database.get("host_profile", probe.id);
  await database.delete("host_profile", probe.id);

  if (!savedProbe || savedProbe.id !== probe.id) {
    throw new Error("IndexedDB read/write verification failed.");
  }
}
