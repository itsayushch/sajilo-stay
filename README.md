# SajiloStay

SajiloStay is an offline-first PWA for first-time homestay hosts in Darjeeling tea-garden villages.

## Optional online AI

When deployed to Vercel with a server-side `GROQ_API_KEY`, the app can use Groq as an optional first tier for translation and listing writing. The key is read only by `app/api/ai/route.ts`; it is never sent to the browser. Copy `.env.example` to `.env.local` for local development.

Every feature remains usable with no network connection. Translation falls back from Groq to Chrome on-device Translator, then cached Transformers.js OPUS models, then a homestay phrasebook. Listing writing falls back from Groq to Chrome Prompt API, then a deterministic template. The Force offline setting bypasses Groq regardless of connection state for demos and judging.

## Run and deploy

Use `pnpm install`, `pnpm dev`, and `pnpm run build`. Deploy this Next.js app to Vercel; static export is intentionally not used because the optional Groq tier needs a server-side API route.
