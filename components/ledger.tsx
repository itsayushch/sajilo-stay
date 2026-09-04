"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { bookingsToCsv } from "@/lib/csv";
import { Booking, BookingStatus, deleteBooking, getBookings, saveBooking } from "@/lib/db";
import { ConnectionStatus } from "@/components/connection-status";

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
      .catch((error: unknown) => {
        console.error("SajiloStay could not read bookings from IndexedDB.", error);
        setNotice("Could not open offline bookings. Please try again.");
      });
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
    } catch (error: unknown) {
      console.error("SajiloStay could not save a booking to IndexedDB.", error);
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
    } catch (error: unknown) {
      console.error("SajiloStay could not remove a booking from IndexedDB.", error);
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
    <main className="site-shell mx-auto min-h-screen max-w-lg px-4 py-6">
      <ConnectionStatus />
      <Link href="/" className="home-link inline-flex min-h-11 items-center text-sm font-bold">← Back</Link>
      <header className="mt-6">
        <p className="text-sm font-bold text-[#1f5d3b]">Your hosting register</p>
        <h1 className="mt-1 text-3xl font-bold">Bookings & cash</h1>
        <p className="muted-copy mt-2 text-base leading-6">Keep guest dates and payments safely on this phone.</p>
      </header>

      <section aria-label="Ledger totals" className="mt-6 grid grid-cols-2 gap-3">
        <div className="paper-panel p-4"><p className="muted-copy text-sm font-semibold">Expected</p><p className="sign-title mt-1 text-2xl font-bold">{formatAmount(totals.all)}</p></div>
        <div className="border-b-4 border-[#b97732] bg-white p-4"><p className="muted-copy text-sm font-semibold">Received</p><p className="sign-title wood-accent mt-1 text-2xl font-bold">{formatAmount(totals.paid)}</p></div>
      </section>

      <section className="register-panel mt-6 p-4">
        <div className="flex items-center justify-between gap-4 border-b border-[#b9ccc0] pb-3"><h2 className="text-2xl font-bold">Your bookings</h2><button type="button" onClick={exportCsv} disabled={!bookings.length} className="min-h-10 rounded-md !border-[#9dbec9] !bg-white px-3 text-sm font-bold !text-[#15506d] !shadow-none hover:!border-[#15506d] hover:!bg-[#eef8fb] disabled:cursor-not-allowed disabled:!border-[#d8e3e7] disabled:!bg-[#f3f7f8] disabled:!text-[#8a9ba3] disabled:!opacity-100">Export CSV</button></div>
        {bookings.length ? <ul className="mt-1 divide-y divide-[#c7d4ca]">{bookings.map((booking) => <li key={booking.id} className="py-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{booking.guestName}</p><p className="muted-copy mt-1 text-sm">{booking.checkIn} to {booking.checkOut}</p><p className="mt-1 text-sm font-semibold">{formatAmount(booking.amount)} · <span className={booking.status === "paid" ? "text-[#1f5d3b]" : "wood-accent"}>{booking.status === "paid" ? "Paid" : "Pending"}</span></p>{booking.notes && <p className="muted-copy mt-1 text-sm">{booking.notes}</p>}</div><div className="flex flex-col items-end gap-1"><button type="button" onClick={() => editBooking(booking)} className="min-h-9 rounded-md !border-[#9dbec9] !bg-white px-2 text-xs font-bold !text-[#15506d] !shadow-none hover:!bg-[#eef8fb]">Edit</button><button type="button" onClick={() => removeBooking(booking)} className="min-h-9 rounded-md !border-red-200 !bg-red-50 px-2 text-xs font-bold !text-red-700 !shadow-none hover:!bg-red-100">Remove</button></div></div></li>)}</ul> : <p className="muted-copy mt-4 text-sm">{notice || "No bookings yet."}</p>}
      </section>

      <section className="paper-panel mt-6 p-4">
        <h2 className="text-xl font-bold">{editingId ? "Edit booking" : "Add a booking"}</h2>
        <form onSubmit={submitBooking} className="mt-4 grid gap-4">
          <label className="grid gap-1 text-sm font-semibold">Guest name<input required value={form.guestName} onChange={(event) => updateForm("guestName", event.target.value)} className="min-h-12 rounded-lg border border-slate-300 px-3" /></label>
          <div className="grid grid-cols-2 gap-3"><label className="grid gap-1 text-sm font-semibold">Check-in<input required type="date" value={form.checkIn} onChange={(event) => updateForm("checkIn", event.target.value)} className="min-h-12 rounded-lg border border-slate-300 px-3" /></label><label className="grid gap-1 text-sm font-semibold">Check-out<input required type="date" value={form.checkOut} onChange={(event) => updateForm("checkOut", event.target.value)} className="min-h-12 rounded-lg border border-slate-300 px-3" /></label></div>
          <div className="grid grid-cols-2 gap-3"><label className="grid gap-1 text-sm font-semibold">Amount (₹)<input required min="0" type="number" inputMode="decimal" value={form.amount || ""} onChange={(event) => updateForm("amount", Number(event.target.value))} className="min-h-12 rounded-lg border border-slate-300 px-3" /></label><label className="grid gap-1 text-sm font-semibold">Payment<select value={form.status} onChange={(event) => updateForm("status", event.target.value as BookingStatus)} className="min-h-12 rounded-lg border border-slate-300 px-3"><option value="pending">Pending</option><option value="paid">Paid</option></select></label></div>
          <label className="grid gap-1 text-sm font-semibold">Notes (optional)<textarea value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} rows={3} className="rounded-lg border border-slate-300 px-3 py-2" /></label>
          <div className="flex gap-3"><button type="submit" disabled={isSaving} className="min-h-10 rounded-lg bg-[#1f5d3b] px-3 font-bold text-white disabled:opacity-60">{isSaving ? "Saving…" : editingId ? "Save changes" : "Add booking"}</button>{editingId && <button type="button" onClick={resetForm} className="min-h-10 rounded-lg !border-slate-300 !bg-white px-3 font-bold !text-slate-700 !shadow-none hover:!bg-slate-50">Cancel</button>}</div>
        </form>
      </section>
      <p className="status-line mt-4 text-sm font-bold" role="status">{bookings.length ? notice : ""}</p>
    </main>
  );
}
