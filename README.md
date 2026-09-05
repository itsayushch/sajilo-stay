# Sajilo Stay

**An offline-first homestay companion for first-time hosts in Darjeeling tea-garden villages.**

Sajilo Stay helps a host run the everyday work of a homestay from one low-end Android phone: manage rooms, track bookings and cash, create a listing, prepare for arrivals, and communicate with guests across languages.

It is built for unreliable connectivity. Core host data lives on the device, the app is installable as a PWA, and useful fallbacks remain available without mobile data.

## The problem

Tea-garden families can use homestays as a valuable second income, but first-time hosts often have one shared phone, inconsistent data, no property-management software, and guests who communicate in English, Hindi, Bengali, or Nepali.

The hard part is not only writing a listing. It is recording a booking, tracking cash, knowing which room is available, explaining house rules, and responding confidently when the network drops.

## The solution

| Host need | Sajilo Stay solution |
| --- | --- |
| Bookings and payments | Offline IndexedDB ledger, totals, paid/pending status, edit controls, and CSV export |
| Room availability | Room manager with capacity, status, notes, guest-facing descriptions, and local price suggestions |
| Listing creation | Listing Builder turns rough notes into an editable, guest-ready description |
| Guest communication | Nepali host replies translate outward; incoming guest messages translate into Nepali for the host |
| No-data operation | PWA cache, on-device storage, phrase packs, deterministic templates, and optional Lite Offline AI |
| Consistency | Persistent arrival-readiness checklist |
| Accessibility | English / नेपाली interface switch, responsive layout, clear fields, and large tap targets |

## Features

### Bookings & cash ledger

- Add, edit, and remove bookings
- See expected versus received cash
- Track paid or pending status
- Persist locally and export a CSV ledger

### Room manager

- Add rooms with capacity and availability
- Store rough notes and a guest-facing description
- Manage available, occupied, and maintenance states
- Show a transparent local nightly-price range

### Listing Builder

- Turn informal notes into an editable guest-ready description
- Save locally and share when a messaging/network option is available
- Use a factual offline template whenever AI is unavailable

### Guest Message Helper

Sajilo Stay does not force guests to install another chat app. The host continues using WhatsApp or SMS.

- **Send to guest:** choose or write a Nepali reply, translate it, then copy/share it
- **Understand guest:** paste a guest message and translate it into Nepali for the host’s reference
- Offline phrase packs for booking, arrival, food, stay, and house rules
- Romanized reading help for Nepali phrases
- Saved translations stay on the device

## Offline-first architecture

```text
Next.js + Tailwind host interface
        │
        ├── IndexedDB: profile, rooms, ledger, listing, checklist, messages
        ├── PWA service worker: app shell after first visit
        ├── Saved phrasebook: reliable offline guest-message translations
        ├── Offline templates: listing and room-writing fallback
        └── Optional Lite AI cache: on-device listing writer after download
```

No account or cloud database is required for the core host workflow. That makes the app private, fast, and practical on an unreliable connection.

## AI strategy: progressive enhancement

We do not make the product dependent on a model. Every result identifies its source: **Online AI**, **On-device AI**, or **Offline basic**.

| Capability | Connected | Offline |
| --- | --- | --- |
| Free-form translation | Optional server-side online AI | Saved phrase packs; supported browser translator where available |
| Listing and room writing | Optional online or browser AI | Optional cached Lite AI, then factual local template |
| Pricing | — | Transparent local rule-based suggestion |

### Why saved phrases instead of a large translation model?

General multilingual models can exceed practical browser storage on low-end phones. Sajilo Stay keeps the initial app light and makes common host phrases dependable offline. Free-form translation improves whenever data is available.

## Technology

- Next.js 15, React 19, TypeScript
- Tailwind CSS 4
- IndexedDB via `idb`
- PWA service worker via `@ducanh2912/next-pwa`
- Optional on-device AI with Transformers.js and SmolLM2 135M, downloaded on demand—not bundled into the app
- pnpm

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Production check:

```bash
pnpm run typecheck
pnpm run build
pnpm start
```

## Optional online AI

The core app works without an API key. To enable the optional online AI tier locally, add `GROQ_API_KEY` to `.env` or `.env.local`; never commit it. For deployment, configure it only in the host’s server environment.

## Judge demo flow

1. Show the English / नेपाली interface switch.
2. Add a booking and show expected/received totals.
3. Reload to demonstrate local persistence.
4. Translate a saved Nepali phrase to English, Hindi, or Bengali and show the **Offline basic** tier.
5. Add a room, update availability, and show the price suggestion.
6. After first load, enable airplane mode and show saved ledger data, rooms, checklist, and phrase packs still working.

## Honest limitations and next steps

- Arbitrary free-form translation needs online AI or a browser translator; saved phrase packs are the guaranteed offline path.
- Lite Offline AI needs a one-time download and about 180 MB of browser storage.
- Guest messages are copy/share based and integrate with WhatsApp/SMS rather than a separate guest app.
- Next: encrypted backup/restore, shareable booking confirmations, and broader curated phrase packs.

## Built for a real constraint

Sajilo Stay is not a generic travel dashboard. It is a lightweight tool for a host who may have one phone, uncertain data, and a guest arriving today.
