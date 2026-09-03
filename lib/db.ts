import { DBSchema, IDBPDatabase, openDB } from "idb";

export type BookingStatus = "pending" | "paid";

export interface Booking {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  status: BookingStatus;
  notes: string;
}

export interface ChecklistState {
  itemId: string;
  checked: boolean;
}

export interface Message {
  id: string;
  originalText: string;
  originalLang: string;
  translatedText: string;
  translatedLang: string;
  timestamp: string;
}

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
    value: Booking;
    indexes: { "by-check-in": string };
  };
  messages: {
    key: string;
    value: Message;
    indexes: { "by-timestamp": string };
  };
  checklist_state: {
    key: string;
    value: ChecklistState;
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

export async function getBookings() {
  const database = await getDatabase();
  return database.getAllFromIndex("bookings", "by-check-in");
}

export async function saveBooking(booking: Booking) {
  const database = await getDatabase();
  await database.put("bookings", booking);
}

export async function deleteBooking(id: string) {
  const database = await getDatabase();
  await database.delete("bookings", id);
}

export async function getChecklistStates() {
  const database = await getDatabase();
  return database.getAll("checklist_state");
}

export async function saveChecklistState(state: ChecklistState) {
  const database = await getDatabase();
  await database.put("checklist_state", state);
}

export async function getMessages() {
  const database = await getDatabase();
  return database.getAllFromIndex("messages", "by-timestamp");
}

export async function saveMessage(message: Message) {
  const database = await getDatabase();
  await database.put("messages", message);
}

export async function deleteMessage(id: string) {
  const database = await getDatabase();
  await database.delete("messages", id);
}
