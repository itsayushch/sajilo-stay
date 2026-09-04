# Sajilo Stay

Sajilo Stay is an offline-first Progressive Web App for first-time homestay hosts in Darjeeling tea-garden villages. It helps a family prepare a listing, communicate with guests, record bookings and cash, and work through a hosting-readiness checklist on a low-end phone.

## What works offline

After the app shell has been loaded once, a host can complete the core flow with mobile data and Wi-Fi switched off:

1. Create or edit the local homestay profile.
2. Write and accept a listing with a deterministic price band.
3. Translate the saved homestay phrases between English, Nepali, Hindi, and Bengali.
4. Add bookings, mark them paid or pending, view totals, and export a CSV ledger.
5. Complete the hosting-readiness checklist.

All host data lives in IndexedDB on that device. Sajilo Stay does not need an account or cloud database for its core flow.

## AI behavior and fallbacks

Each AI result displays the source that answered it so the host and judges can see whether the answer came from online AI, an on-device capability, a cached model, or the offline basic fallback.

| Capability | Tier 1: optional online | Tier 2: on-device | Tier 3: local fallback | Tier 4: works with no model |
| --- | --- | --- | --- | --- |
| Guest translation | Groq `openai/gpt-oss-20b` through a server-side Next.js route | Chrome Translator API, when supported | Transformers.js NLLB multilingual model cached in browser Cache Storage for English, Nepali, Hindi, and Bengali | A Nepali/Hindi/Bengali phrasebook for common availability, price, directions, food, and house-rule messages |
| Listing writing | Groq `openai/gpt-oss-20b` | Chrome Prompt API / Gemini Nano, when supported | Cached browser-run SmolLM2 135M instruction model (downloaded on first use, then available offline) | A factual listing template based on the host notes, plus a deterministic price band |

The **Force offline mode** setting always bypasses Groq, even with a live connection. If Chrome AI or a local model is unavailable, the relevant static fallback is used automatically. An uncached translation model is never required while offline; the phrasebook remains available instead.

## Device target and verification status

The design target is Chrome on Android 10+ with a 360 px-wide display, 2 GB RAM, and intermittent connectivity. Inputs use a 16 px minimum font size, important controls have at least a 48 px target, and high-visibility keyboard focus is provided for sunlight and accessibility.

The automated release checks have passed on Windows with Node.js and a production Next.js build. A physical Android minimum-device and install verification is still required before submitting; do not claim it has been tested until the steps below are recorded on the actual device.

## Run locally

```bash
pnpm install
pnpm dev
```

For a production check:

```bash
pnpm run typecheck
pnpm run build
pnpm exec next start -p 3000
```

Open `http://localhost:3000` in Chrome. Development uses `.next-dev` so it does not corrupt the production build output.

## Airplane-mode rehearsal

Do this on the phone intended for the demo:

1. Open the deployed app once online and wait for its first load to finish.
2. Add a profile, a sample booking, a listing, and one guest-chat message. Refresh once so persistence and the service worker can settle.
3. Turn on airplane mode and fully close Chrome. Reopen Sajilo Stay from the home screen or Chrome.
4. Confirm the saved profile, booking, ledger total, listing, chat history, and checklist are present.
5. In Settings, turn on **Force offline mode**. Translate `is the room available?` and generate a listing from short notes. Both must show an offline/on-device source and complete without a network request.
6. Add another pending booking, mark it paid, and export the CSV. Confirm each change survives a refresh while still in airplane mode.

Record this same sequence for the two-minute demo with the phone's airplane-mode indicator visible.

## Deploy and verify installation

Sajilo Stay uses a Next.js API route only for the optional Groq tier, so deploy it to **Vercel** rather than static-only hosting.

1. Push this repository to a Git provider and import it into Vercel.
2. Set the optional `GROQ_API_KEY` environment variable in Vercel. Omit it if you want a strictly offline/on-device deployment; every core feature still works.
3. Deploy with the default `pnpm run build` command.
4. On Android Chrome, open the public HTTPS URL, use **Install app** / **Add to Home screen**, then launch it from the installed icon.
5. Repeat the airplane-mode rehearsal above from the installed app. Confirm that `/manifest.webmanifest` and `/sw.js` load successfully before the test.

`GROQ_API_KEY` belongs only in Vercel's server environment or a local `.env.local`; it is never exposed to the browser. Copy `.env.example` when developing locally.

## Submission checklist

- [ ] Public repository URL added to the submission.
- [ ] Public Vercel HTTPS URL added to the submission.
- [ ] PWA installed and reopened from an Android home screen.
- [ ] Airplane-mode rehearsal completed on the demo phone.
- [ ] Two-minute video recorded with airplane mode visibly enabled.
- [ ] Physical minimum-device details recorded here after the test.
