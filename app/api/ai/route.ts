import { NextResponse } from "next/server";

const supportedLanguages = new Set(["en", "ne", "hi", "bn"]);
const maxInputLength = 2_000;

type AiRequest =
  | { action: "translate"; text: string; sourceLang: string; targetLang: string }
  | { action: "generateListing"; notes: string };

function isRequest(value: unknown): value is AiRequest {
  if (!value || typeof value !== "object" || !("action" in value)) return false;
  const candidate = value as Record<string, unknown>;
  if (candidate.action === "translate") {
    return typeof candidate.text === "string" && candidate.text.trim().length > 0 && candidate.text.length <= maxInputLength && typeof candidate.sourceLang === "string" && typeof candidate.targetLang === "string" && supportedLanguages.has(candidate.sourceLang) && supportedLanguages.has(candidate.targetLang);
  }
  return candidate.action === "generateListing" && typeof candidate.notes === "string" && candidate.notes.trim().length > 0 && candidate.notes.trim().length <= maxInputLength;
}

async function askGroq(system: string, user: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      temperature: 0.2,
      max_completion_tokens: 300,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    }),
  });
  if (!response.ok) return null;
  const payload: unknown = await response.json();
  const content = (payload as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0]?.message?.content;
  return typeof content === "string" && content.trim() ? content.trim() : null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!isRequest(body)) return NextResponse.json({ error: "Invalid AI request." }, { status: 400 });

  try {
    if (body.action === "translate") {
      const translation = await askGroq(
        "Translate accurately and naturally. Return only the translation, with no explanation.",
        `Translate from ${body.sourceLang} to ${body.targetLang}:\n${body.text}`,
      );
      if (!translation) return NextResponse.json({ error: "Online AI is unavailable." }, { status: 500 });
      return NextResponse.json({ translation });
    }
    const copy = await askGroq(
      "Write a warm, factual 70-word homestay listing in plain English. Turn the host notes into a complete guest-facing paragraph; do not quote, repeat, or label the notes. Do not invent facilities, prices, or locations. Return only the listing copy.",
      `Host notes:\n${body.notes}`,
    );
    if (!copy) return NextResponse.json({ error: "Online AI is unavailable." }, { status: 500 });
    return NextResponse.json({ copy });
  } catch {
    return NextResponse.json({ error: "Online AI is unavailable." }, { status: 500 });
  }
}
