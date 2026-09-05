# Sajilo Stay

**An offline-first homestay companion for first-time hosts in Darjeeling tea-garden villages.**

Sajilo Stay helps a host run the everyday work of a homestay from one low-end Android phone: manage rooms, track bookings and cash, create a listing, prepare for arrivals, and communicate with guests across languages.

It is built for unreliable connectivity. Core host data lives on the device, the app is installable as a PWA, and useful fallbacks remain available without mobile data.

## Why the name “Sajilo Stay”?

**Sajilo (सजिलो)** is a familiar Nepali word meaning *easy*, *simple*, or *made manageable*. The name reflects the product promise: hosting should not require complex software, fluent English, or a reliable internet connection.

The app is intentionally usable by hosts who do not read English:

- The host interface can be switched between **English** and **नेपाली** at any time.
- The language choice is stored on the phone and works without data.
- Common offline guest-reply phrases are written first in Nepali and include a romanized reading guide.
- The Guest Message Helper separates what the host writes in Nepali from what a guest sends in another language, translating incoming messages into Nepali for the host’s reference.

In short: English-speaking visitors can receive a clear message, while the host can continue working in a familiar local language.

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

## Deliberately small, mobile-first design

Sajilo Stay is intentionally **not a desktop-style property-management dashboard squeezed onto a phone**. Its primary user may have a low-end Android phone, one hand free while hosting, limited screen space, and bright outdoor conditions.

Instead of adding desktop sidebars, dense tables, or a different desktop workflow, the product uses one calm, single-column flow with large, readable actions. It is responsive in the practical sense—controls reflow safely for small and larger screens—but the information architecture stays mobile-first everywhere. A judge opening it on desktop sees the same focused phone workflow, rather than a feature-heavy admin panel that would make the real target device harder to use.

Design choices include:

- A compact `max-w-lg` reading width so forms and actions remain reachable
- Large touch targets, visible focus states, clear input boundaries, and high-contrast controls
- One primary action at a time instead of crowded toolbars
- No image-heavy hero sections, maps, charts, or decorative animation
- English / नेपाली controls and local-language phrases placed close to the task where they matter

## Keeping the app lightweight

The offline requirement does not mean shipping a huge app up front. We keep the initial experience small by design:

- Tailwind CSS and hand-built React components instead of a large UI component library
- Local Manrope font and simple CSS shapes instead of image assets
- IndexedDB for device storage; no authentication SDK, analytics SDK, cloud database client, or real-time chat service
- Phrase packs and rule-based templates for reliable offline tasks instead of bundling a multi-gigabyte translation model
- The Lite listing model is **optional and downloaded on demand** only when a host chooses it; it is not part of the initial application bundle
- Dynamic imports defer AI runtime code until an AI feature is actually used
- PWA caching keeps the app shell available after first load without forcing large model files into the service-worker precache

This lets Sajilo Stay prioritize a fast first visit and dependable everyday offline actions, while still offering richer AI assistance on devices with enough storage and connectivity.

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

## Core Feature Walkthrough

1. **Bilingual Interface:** The application features a seamless toggle between English and नेपाली interfaces to accommodate local hosts.
2. **Ledger & Finances:** The system simplifies booking entries while automatically tracking and displaying expected versus received payment totals.
3. **Local Persistence:** Data is cached locally in the browser, ensuring all records and configurations remain fully intact across page reloads.
4. **Offline Translation (Basic Tier):** Pre-saved Nepali phrases can be translated into English, Hindi, or Bengali entirely offline using guaranteed phrase packs.
5. **Room Management:** The interface allows for quick room additions, real-time availability updates, and automated price suggestions.
6. **True Offline-First Architecture:** Once initially loaded, the app operates entirely without an internet connection. Ledger data, room status, checklists, and translation phrase packs remain completely functional even in airplane mode.

## Honest Limitations & Next Steps

- **Translation Constraints:** Arbitrary free-form translation currently requires an online AI or browser translator. The saved phrase packs serve as the guaranteed offline communication path.
- **Storage Requirements:** The Lite Offline AI feature requires a one-time download and utilizes approximately 180 MB of browser storage.
- **Messaging Workflow:** Guest communications utilize native device sharing (integrating directly with WhatsApp or SMS) rather than forcing guests or hosts to use a separate messaging app.
- **Roadmap:** Upcoming features include encrypted data backup and restore capabilities, shareable digital booking confirmations, and an expanded library of curated phrase packs.

## Built for a Real Constraint

Sajilo Stay is not a generic travel dashboard. It is a lightweight, highly resilient tool designed specifically for a local host who may be operating with a single smartphone, unreliable mobile data, and a guest arriving today.


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

The core app works without an API key. To enable the optional online AI tier locally, add `GROQ_API_KEY` to `.env`
