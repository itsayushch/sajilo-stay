"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Room, RoomStatus, deleteRoom, getHostProfile, getRooms, saveRoom } from "@/lib/db";
import { ConnectionStatus } from "@/components/connection-status";
import { generateRoomDescription, suggestRoomPrice } from "@/lib/listing";

const statuses: Array<{ value: RoomStatus; label: string; className: string }> = [
  { value: "available", label: "Available", className: "bg-[#e4f3ec] text-[#17634d]" },
  { value: "occupied", label: "Occupied", className: "bg-[#fff0d9] text-[#97560c]" },
  { value: "maintenance", label: "Maintenance", className: "bg-[#f3e8e8] text-[#9b3d3d]" },
];

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `room-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function statusInfo(status: RoomStatus) {
  return statuses.find((item) => item.value === status) ?? statuses[0];
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export function RoomManager() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [profileRoomCount, setProfileRoomCount] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(2);
  const [status, setStatus] = useState<RoomStatus>("available");
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState<Room | null>(null);
  const [message, setMessage] = useState("Loading rooms…");
  const [isWriting, setIsWriting] = useState(false);

  useEffect(() => {
    Promise.all([getRooms(), getHostProfile()])
      .then(([savedRooms, profile]) => {
        setRooms(savedRooms);
        setProfileRoomCount(profile?.rooms ?? null);
        setMessage(savedRooms.length ? "Room availability is saved on this phone." : "Add each guest room to manage its availability.");
      })
      .catch((error) => {
        console.error("Sajilo Stay could not open rooms.", error);
        setMessage("Could not open rooms. Please try again.");
      });
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || capacity < 1) {
      setMessage("Add a room name and at least one guest space.");
      return;
    }
    const room: Room = { id: editing?.id ?? makeId(), name: name.trim(), capacity, status, notes: notes.trim(), description: description.trim() };
    try {
      await saveRoom(room);
      setRooms((current) => [...current.filter((item) => item.id !== room.id), room].sort((first, second) => first.name.localeCompare(second.name, undefined, { numeric: true })));
      setName("");
      setCapacity(2);
      setStatus("available");
      setNotes("");
      setDescription("");
      setEditing(null);
      setMessage(editing ? "Room updated." : "Room added.");
    } catch (error) {
      console.error("Sajilo Stay could not save a room.", error);
      setMessage("Could not save this room. Please try again.");
    }
  }

  function startEdit(room: Room) {
    setEditing(room);
    setName(room.name);
    setCapacity(room.capacity);
    setStatus(room.status);
    setNotes(room.notes ?? "");
    setDescription(room.description ?? "");
    setMessage(`Editing ${room.name}.`);
  }

  function cancelEdit() {
    setEditing(null);
    setName("");
    setCapacity(2);
    setStatus("available");
    setNotes("");
    setDescription("");
    setMessage("Room edit cancelled.");
  }

  async function writeDescription() {
    if (!name.trim() || !notes.trim()) {
      setMessage("Add a room name and rough notes first.");
      return;
    }
    setIsWriting(true);
    setMessage("Writing a room description…");
    try {
      const result = await generateRoomDescription(name.trim(), capacity, notes.trim());
      setDescription(result.copy);
      setMessage(`${result.tier === "online-ai" ? "Online AI" : result.tier === "on-device-ai" ? "Lite offline AI" : "Offline basic"} · review the room description before saving.`);
    } catch {
      setMessage("Could not write a room description. Please try again.");
    } finally {
      setIsWriting(false);
    }
  }

  async function removeRoom(room: Room) {
    if (!window.confirm(`Delete ${room.name}? This cannot be undone.`)) return;
    try {
      await deleteRoom(room.id);
      setRooms((current) => current.filter((item) => item.id !== room.id));
      if (editing?.id === room.id) cancelEdit();
      setMessage(`${room.name} deleted.`);
    } catch (error) {
      console.error("Sajilo Stay could not delete a room.", error);
      setMessage("Could not delete this room. Please try again.");
    }
  }

  return <main className="site-shell mx-auto min-h-screen max-w-lg px-4 py-6 sm:px-5"><ConnectionStatus /><Link href="/" className="home-link inline-flex min-h-11 items-center text-sm font-bold">← Back</Link><header className="mt-6"><p className="text-sm font-bold text-[#1f5d3b]">Your home, room by room</p><h1 className="mt-1 text-3xl font-extrabold">Rooms</h1><p className="muted-copy mt-2 text-sm leading-6">Name each guest room, write a clear description, and keep availability current.</p></header>{profileRoomCount !== null && <p className="mt-4 rounded-xl border border-[#d6e5e9] bg-white/70 px-3 py-2 text-xs font-bold text-[#5e7085]">Your profile says {profileRoomCount} guest room{profileRoomCount === 1 ? "" : "s"}. You have added {rooms.length} here.</p>}<section className="paper-panel mt-5 p-4"><h2 className="text-lg font-extrabold">{editing ? `Edit ${editing.name}` : "Add a room"}</h2><form onSubmit={submit} className="mt-3 grid gap-3"><label className="grid gap-1 text-sm font-bold">Room name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Garden Room" className="min-h-11 rounded-lg border-[#c9d9df] bg-[#fbfdfd] px-3" /></label><div className="grid grid-cols-2 gap-3"><label className="grid gap-1 text-sm font-bold">Guest capacity<input type="number" min="1" max="12" inputMode="numeric" value={capacity} onChange={(event) => setCapacity(Number(event.target.value))} className="min-h-11 rounded-lg border-[#c9d9df] bg-[#fbfdfd] px-3" /></label><label className="grid gap-1 text-sm font-bold">Availability<select value={status} onChange={(event) => setStatus(event.target.value as RoomStatus)} className="min-h-11 rounded-lg border-[#c9d9df] bg-[#fbfdfd] px-3">{statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label></div><label className="grid gap-1 text-sm font-bold">Rough room notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="e.g. garden-facing, sunny morning light, attached bathroom" className="rounded-lg border-[#c9d9df] bg-[#fbfdfd] px-3 py-2" /></label><button type="button" onClick={writeDescription} disabled={isWriting} className="justify-self-start min-h-10 rounded-lg !border-[#9dbec9] !bg-white px-3 text-sm font-extrabold !text-[#15506d] !shadow-none hover:!bg-[#eef8fb] disabled:opacity-60">{isWriting ? "Writing…" : "Write description with Lite AI"}</button>{description && <label className="grid gap-1 text-sm font-bold">Guest-facing room description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="rounded-lg border-[#c9d9df] bg-[#fbfdfd] px-3 py-2" /></label>}<div className="flex flex-wrap gap-2"><button type="submit" className="min-h-10 rounded-lg !bg-[#15506d] px-3 text-sm font-extrabold !text-white">{editing ? "Save room" : "Add room"}</button>{editing && <button type="button" onClick={cancelEdit} className="min-h-10 rounded-lg !border-[#9dbec9] !bg-white px-3 text-sm font-extrabold !text-[#15506d] !shadow-none hover:!bg-[#eef8fb]">Cancel</button>}</div></form></section><section className="mt-6 pb-6"><div className="flex items-baseline justify-between"><h2 className="text-xl font-extrabold">Your rooms</h2><span className="text-xs font-bold text-[#5e7085]">{rooms.length}</span></div>{rooms.length ? <ul className="mt-3 grid gap-3">{rooms.map((room) => { const roomStatus = statusInfo(room.status); const roomPrice = suggestRoomPrice(room.notes ?? "", room.capacity); return <li key={room.id} className="register-panel p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-base font-extrabold">{room.name}</h3><p className="mt-1 text-sm text-[#5e7085]">Up to {room.capacity} guest{room.capacity === 1 ? "" : "s"}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${roomStatus.className}`}>{roomStatus.label}</span></div>{room.description && <p className="mt-3 border-t border-[#dce8e8] pt-3 text-sm leading-6 text-[#35465b]">{room.description}</p>}<div className="mt-3 rounded-lg border border-[#f0ddbf] bg-[#fff9f0] px-3 py-2"><p className="text-xs font-bold text-[#8a551e]">Suggested nightly price</p><p className="mt-0.5 text-base font-extrabold text-[#8a551e]">{formatPrice(roomPrice.min)}–{formatPrice(roomPrice.max)}</p></div><div className="mt-4 flex gap-2"><button type="button" onClick={() => startEdit(room)} className="min-h-9 rounded-md !border-[#9dbec9] !bg-white px-3 text-xs font-extrabold !text-[#15506d] !shadow-none hover:!bg-[#eef8fb]">Edit</button><button type="button" onClick={() => removeRoom(room)} className="min-h-9 rounded-md !border-red-200 !bg-red-50 px-3 text-xs font-extrabold !text-red-700 !shadow-none hover:!bg-red-100">Delete</button></div></li>; })}</ul> : <div className="mt-3 rounded-xl border border-dashed border-[#c8dce0] bg-white/50 px-4 py-5 text-center"><p className="text-sm font-bold text-[#35465b]">No rooms added yet.</p><p className="mt-1 text-xs leading-5 text-[#5e7085]">Add your first room above to manage its availability.</p></div>}</section><p className="status-line text-sm font-bold" role="status">{message}</p></main>;
}
