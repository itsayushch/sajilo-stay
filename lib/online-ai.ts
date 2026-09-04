type AiRequest =
  | { action: "translate"; text: string; sourceLang: string; targetLang: string }
  | { action: "generateListing"; notes: string };

/** Requests the optional server tier. Any failure intentionally returns null for local fallbacks. */
export async function requestOnlineAi(request: AiRequest) {
  if (typeof window === "undefined") return null;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 5_000);
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    if (!response.ok) {
      console.warn(`Sajilo Stay online AI request failed with HTTP ${response.status}; using a local fallback.`);
      return null;
    }
    const data: unknown = await response.json();
    if (!data || typeof data !== "object") return null;
    const value = request.action === "translate" ? (data as { translation?: unknown }).translation : (data as { copy?: unknown }).copy;
    return typeof value === "string" && value.trim() ? value.trim() : null;
  } catch (error) {
    console.warn("Sajilo Stay online AI request failed; using a local fallback.", error);
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}
