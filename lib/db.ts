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

export interface HostProfile {
  id: string;
  homeName: string;
  location: string;
  rooms: number;
  amenities: string[];
  preferredLanguage: string;
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
  kind?: "host-reply" | "guest-message";
}

export interface Listing {
  id: string;
  rawNotes: string;
  generatedCopy: string;
  suggestedPriceMin: number;
  suggestedPriceMax: number;
  lastUpdated: string;
}

export type RoomStatus = "available" | "occupied" | "maintenance";

export interface Room {
  id: string;
  name: string;
  capacity: number;
  status: RoomStatus;
  notes?: string;
  description?: string;
}

export interface SajiloStayDB extends DBSchema {
  host_profile: {
    key: string;
    value: HostProfile;
  };
  listing: {
    key: string;
    value: Listing;
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
  rooms: {
    key: string;
    value: Room;
  };
  // Legacy store retained in the type only so version 4 can delete it safely.
  app_settings: {
    key: string;
    value: { name: string; value: boolean };
  };
}

let databasePromise: Promise<IDBPDatabase<SajiloStayDB>> | undefined;

export function getDatabase() {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser.");
  }

  databasePromise ??= openDB<SajiloStayDB>("sajilo-stay", 5, {
    upgrade(database, _oldVersion, _newVersion, transaction) {
      if (!database.objectStoreNames.contains("host_profile")) database.createObjectStore("host_profile", { keyPath: "id" });
      if (!database.objectStoreNames.contains("listing")) database.createObjectStore("listing", { keyPath: "id" });
      if (!database.objectStoreNames.contains("bookings")) {
        const bookings = database.createObjectStore("bookings", { keyPath: "id" });
        bookings.createIndex("by-check-in", "checkIn");
      } else {
        const bookings = transaction.objectStore("bookings");
        if (!bookings.indexNames.contains("by-check-in")) bookings.createIndex("by-check-in", "checkIn");
      }
      if (!database.objectStoreNames.contains("messages")) {
        const messages = database.createObjectStore("messages", { keyPath: "id" });
        messages.createIndex("by-timestamp", "timestamp");
      } else {
        const messages = transaction.objectStore("messages");
        if (!messages.indexNames.contains("by-timestamp")) messages.createIndex("by-timestamp", "timestamp");
      }
      if (!database.objectStoreNames.contains("checklist_state")) database.createObjectStore("checklist_state", { keyPath: "itemId" });
      if (!database.objectStoreNames.contains("rooms")) database.createObjectStore("rooms", { keyPath: "id" });
      if (database.objectStoreNames.contains("app_settings")) database.deleteObjectStore("app_settings");
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
  return (await database.getAll("bookings")).sort((first, second) => first.checkIn.localeCompare(second.checkIn));
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

export async function getHostProfile() {
  const database = await getDatabase();
  return database.get("host_profile", "primary");
}

export async function saveHostProfile(profile: HostProfile) {
  const database = await getDatabase();
  await database.put("host_profile", profile);
}

export async function getListing() {
  const database = await getDatabase();
  return database.get("listing", "primary");
}

export async function saveListing(listing: Listing) {
  const database = await getDatabase();
  await database.put("listing", listing);
}

export async function deleteListing() {
  const database = await getDatabase();
  await database.delete("listing", "primary");
}

export async function getRooms() {
  const database = await getDatabase();
  return (await database.getAll("rooms")).sort((first, second) => first.name.localeCompare(second.name, undefined, { numeric: true }));
}

export async function saveRoom(room: Room) {
  const database = await getDatabase();
  await database.put("rooms", room);
}

export async function deleteRoom(id: string) {
  const database = await getDatabase();
  await database.delete("rooms", id);
}
