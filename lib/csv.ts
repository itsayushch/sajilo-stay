import type { Booking } from "@/lib/db";

function escapeCsvCell(value: string | number) {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function bookingsToCsv(bookings: Booking[]) {
  const rows = [
    ["Guest name", "Check-in", "Check-out", "Amount (INR)", "Payment status", "Notes"],
    ...bookings.map((booking) => [
      booking.guestName,
      booking.checkIn,
      booking.checkOut,
      booking.amount,
      booking.status,
      booking.notes,
    ]),
  ];

  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}
