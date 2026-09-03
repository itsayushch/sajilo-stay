"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { bookingsToCsv } from "@/lib/csv";
import { Booking, BookingStatus, deleteBooking, getBookings, saveBooking } from "@/lib/db";

type BookingForm = Omit<Booking, "id">;

const emptyForm: BookingForm = {
  guestName: "",
  checkIn: "",
  checkOut: "",
  amount: 0,
  status: "pending",
  notes: "",
};

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `booking-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function Ledger() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [form, setForm] = useState<BookingForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("Loading bookings…");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getBookings()
      .then((savedBookings) => {
        setBookings(savedBookings);
        setNotice(savedBookings.length ? "" : "No bookings yet. Add your first guest below.");
      })
      .catch(() => setNotice("Could not open offline bookings. Please try again."));
  }, []);

  const totals = useMemo(() => ({
    all: bookings.reduce((sum, booking) => sum + booking.amount, 0),
    paid: bookings.filter((booking) => booking.status === "paid").reduce((sum, booking) => sum + booking.amount, 0),
  }), [bookings]);

  function updateForm<Key extends keyof BookingForm>(key: Key, value: BookingForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.guestName.trim() || !form.checkIn || !form.checkOut) {
      setNotice("Please enter a guest name and both dates.");
      return;
    }
    if (form.checkOut < form.checkIn) {
      setNotice("Check-out must be on or after check-in.");
      return;
    }
    if (!Number.isFinite(form.amount) || form.amount < 0) {
      setNotice("Amount must be zero or more.");
      return;
    }

    const booking: Booking = { ...form, guestName: form.guestName.trim(), notes: form.notes.trim(), id: editingId ?? createId() };
    const previousBookings = bookings;
    const nextBookings = [...bookings.filter((item) => item.id !== booking.id), booking].sort((a, b) => a.checkIn.localeCompare(b.checkIn));
    setBookings(nextBookings);
    resetForm();
    setIsSaving(true);
    setNotice("Saved offline.");

    try {
      await saveBooking(booking);
    } catch {
      setBookings(previousBookings);
      setNotice("Could not save this booking. Your last saved records are unchanged.");
    } finally {
      setIsSaving(false);
    }
  }

  function editBooking(booking: Booking) {
    const { id, ...nextForm } = booking;
    setEditingId(id);
    setForm(nextForm);
    setNotice(`Editing ${booking.guestName}.`);
  }

  async function removeBooking(booking: Booking) {
    const previousBookings = bookings;
    setBookings((current) => current.filter((item) => item.id !== booking.id));
    setNotice("Booking removed.");
    try {
      await deleteBooking(booking.id);
    } catch {
      setBookings(previousBookings);
      setNotice("Could not remove this booking. Your saved record is unchanged.");
    }
  }

  function exportCsv() {
    const file = new Blob([bookingsToCsv(bookings)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "sajilostay-bookings.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("CSV saved to this device.");
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-6">
      <Link href="/" className="text-sm font-bold text-[#1f5d3b]">← Home</Link>
      <header className="mt-6">
        <h1 className="text-3xl font-bold">Bookings & Ledger</h1>
        <p className="mt-2 text-base leading-6 text-slate-700">Keep guest dates and payments safely on this phone.</p>
      </header>

      <section aria-label="Ledger totals" className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><p className="text-sm text-slate-700">Expected</p><p className="mt-1 text-xl font-bold">{formatAmount(totals.all)}</p></div>
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><p className="text-sm text-slate-700">Received</p><p className="mt-1 text-xl font-bold text-[#1f5d3b]">{formatAmount(totals.paid)}</p></div>
      </section>

      <section className="mt-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-bold">Your bookings</h2><button type="button" onClick={exportCsv} disabled={!bookings.length} className="rounded-lg border border-[#1f5d3b] px-3 py-2 text-sm font-bold text-[#1f5d3b] disabled:cursor-not-allowed disabled:opacity-50">Export CSV</button></div>
        {bookings.length ? <ul className="mt-4 divide-y divide-slate-200">{bookings.map((booking) => <li key={booking.id} className="py-4 first:pt-0"><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{booking.guestName}</p><p className="mt-1 text-sm text-slate-700">{booking.checkIn} to {booking.checkOut}</p><p className="mt-1 text-sm font-semibold">{formatAmount(booking.amount)} · <span className={booking.status === "paid" ? "text-[#1f5d3b]" : "text-amber-700"}>{booking.status === "paid" ? "Paid" : "Pending"}</span></p>{booking.notes && <p className="mt-1 text-sm text-slate-600">{booking.notes}</p>}</div><div className="flex flex-col items-end gap-1"><button type="button" onClick={() => editBooking(booking)} className="rounded-lg px-3 py-2 text-sm font-bold text-[#1f5d3b] underline">Edit</button><button type="button" onClick={() => removeBooking(booking)} className="rounded-lg px-3 py-2 text-sm font-bold text-red-700 underline">Remove</button></div></div></li>)}</ul> : <p className="mt-4 text-sm text-slate-700">{notice || "No bookings yet."}</p>}
      </section>

      <section className="mt-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-bold">{editingId ? "Edit booking" : "Add a booking"}</h2>
        <form onSubmit={submitBooking} className="mt-4 grid gap-4">
          <label className="grid gap-1 text-sm font-semibold">Guest name<input required value={form.guestName} onChange={(event) => updateForm("guestName", event.target.value)} className="min-h-12 rounded-lg border border-slate-300 px-3" /></label>
          <div className="grid grid-cols-2 gap-3"><label className="grid gap-1 text-sm font-semibold">Check-in<input required type="date" value={form.checkIn} onChange={(event) => updateForm("checkIn", event.target.value)} className="min-h-12 rounded-lg border border-slate-300 px-3" /></label><label className="grid gap-1 text-sm font-semibold">Check-out<input required type="date" value={form.checkOut} onChange={(event) => updateForm("checkOut", event.target.value)} className="min-h-12 rounded-lg border border-slate-300 px-3" /></label></div>
          <div className="grid grid-cols-2 gap-3"><label className="grid gap-1 text-sm font-semibold">Amount (₹)<input required min="0" type="number" inputMode="decimal" value={form.amount || ""} onChange={(event) => updateForm("amount", Number(event.target.value))} className="min-h-12 rounded-lg border border-slate-300 px-3" /></label><label className="grid gap-1 text-sm font-semibold">Payment<select value={form.status} onChange={(event) => updateForm("status", event.target.value as BookingStatus)} className="min-h-12 rounded-lg border border-slate-300 px-3"><option value="pending">Pending</option><option value="paid">Paid</option></select></label></div>
          <label className="grid gap-1 text-sm font-semibold">Notes (optional)<textarea value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} rows={3} className="rounded-lg border border-slate-300 px-3 py-2" /></label>
          <div className="flex gap-3"><button type="submit" disabled={isSaving} className="min-h-12 rounded-lg bg-[#1f5d3b] px-4 font-bold text-white disabled:opacity-60">{isSaving ? "Saving…" : editingId ? "Save changes" : "Add booking"}</button>{editingId && <button type="button" onClick={resetForm} className="min-h-12 rounded-lg px-4 font-bold text-slate-700 underline">Cancel</button>}</div>
        </form>
      </section>
      <p className="mt-4 text-sm font-medium text-[#1f5d3b]" role="status">{bookings.length ? notice : ""}</p>
    </main>
  );
}
