export const languages = {
  en: "English",
  ne: "Nepali",
  hi: "Hindi",
  bn: "Bengali",
} as const;

export type LanguageCode = keyof typeof languages;
export type TranslationTier = "online-ai" | "on-device-ai" | "cached-model" | "offline-basic";

export interface TranslationResult {
  text: string;
  tier: TranslationTier;
  note?: string;
}

export interface ModelDownloadProgress {
  progress: number;
  file?: string;
}

type BrowserTranslator = {
  translate(text: string): Promise<string>;
};

type BrowserTranslatorApi = {
  availability(options: { sourceLanguage: string; targetLanguage: string }): Promise<"available" | "downloadable" | "downloading" | "unavailable">;
  create(options: { sourceLanguage: string; targetLanguage: string }): Promise<BrowserTranslator>;
};

const browserTranslator = globalThis as typeof globalThis & { Translator?: BrowserTranslatorApi };

const modelForPair: Partial<Record<`${LanguageCode}-${LanguageCode}`, string>> = {
  "en-ne": "Xenova/opus-mt-en-ne",
  "ne-en": "Xenova/opus-mt-ne-en",
  "en-hi": "Xenova/opus-mt-en-hi",
  "hi-en": "Xenova/opus-mt-hi-en",
  "en-bn": "Xenova/opus-mt-en-bn",
  "bn-en": "Xenova/opus-mt-bn-en",
};

const phrasebook: Record<string, Partial<Record<LanguageCode, string>>> = {
  "is the room available?": { ne: "कोठा उपलब्ध छ?", hi: "क्या कमरा उपलब्ध है?", bn: "ঘরটি কি খালি আছে?" },
  "what is the price per night?": { ne: "प्रति रातको मूल्य कति हो?", hi: "प्रति रात का किराया कितना है?", bn: "প্রতি রাতের ভাড়া কত?" },
  "how do i get there?": { ne: "म त्यहाँ कसरी पुग्न सक्छु?", hi: "मैं वहाँ कैसे पहुँचूँ?", bn: "আমি সেখানে কীভাবে যাব?" },
  "do you serve food?": { ne: "खाना उपलब्ध छ?", hi: "क्या खाना मिलता है?", bn: "খাবার পাওয়া যায় কি?" },
  "what are the house rules?": { ne: "घरका नियमहरू के हुन्?", hi: "घर के नियम क्या हैं?", bn: "বাড়ির নিয়ম কী?" },
  "we have a room available.": { ne: "हामीसँग एउटा कोठा उपलब्ध छ।", hi: "हमारे पास एक कमरा उपलब्ध है।", bn: "আমাদের একটি ঘর খালি আছে।" },
  "the price is ₹2500 per night.": { ne: "मूल्य प्रति रात रु २५०० हो।", hi: "कीमत ₹2500 प्रति रात है।", bn: "প্রতি রাতের ভাড়া ₹2500।" },
  "please arrive before 8 pm.": { ne: "कृपया बेलुका ८ बजेअघि आइपुग्नुहोस्।", hi: "कृपया रात 8 बजे से पहले पहुँचें।", bn: "অনুগ্রহ করে রাত ৮টার আগে আসুন।" },
  "breakfast and dinner are available.": { ne: "बिहानको खाजा र बेलुकाको खाना उपलब्ध छ।", hi: "नाश्ता और रात का खाना उपलब्ध है।", bn: "সকালের নাশতা ও রাতের খাবার পাওয়া যায়।" },
  "please remove shoes inside.": { ne: "कृपया भित्र जुत्ता खोल्नुहोस्।", hi: "कृपया अंदर जूते उतारें।", bn: "অনুগ্রহ করে ভেতরে জুতা খুলুন।" },
};

function normalize(text: string) {
  return text.trim().toLocaleLowerCase();
}

function translateFromPhrasebook(text: string, targetLanguage: LanguageCode): TranslationResult {
  const key = normalize(text);
  const direct = phrasebook[key]?.[targetLanguage];
  if (direct) return { text: direct, tier: "offline-basic" };

  for (const translations of Object.values(phrasebook)) {
    if (Object.values(translations).some((translation) => normalize(translation ?? "") === key)) {
      const translated = translations[targetLanguage];
      if (translated) return { text: translated, tier: "offline-basic" };
    }
  }

  return {
    text,
    tier: "offline-basic",
    note: "This sentence is not in the saved offline phrasebook yet. Try one of the quick phrases below.",
  };
}

async function translateWithChrome(text: string, sourceLanguage: LanguageCode, targetLanguage: LanguageCode) {
  if (!browserTranslator.Translator) return null;
  const options = { sourceLanguage, targetLanguage };
  const availability = await browserTranslator.Translator.availability(options);
  if (availability === "unavailable") return null;
  const translator = await browserTranslator.Translator.create(options);
  return translator.translate(text);
}

async function translateWithCachedModel(text: string, sourceLanguage: LanguageCode, targetLanguage: LanguageCode) {
  const model = modelForPair[`${sourceLanguage}-${targetLanguage}`];
  if (!model) return null;

  const { env, pipeline } = await import("@huggingface/transformers");
  env.useBrowserCache = true;
  env.cacheKey = "sajilostay-translation-models";
  const translator = await pipeline("translation", model, { dtype: "q8" });
  const output = await translator(text);
  const result = Array.isArray(output) ? output[0] : output;
  if (!result || typeof result !== "object" || !("translation_text" in result) || typeof result.translation_text !== "string") {
    throw new Error("The on-device model returned an unexpected response.");
  }
  return result.translation_text;
}

export function getTranslationModelPlan(sourceLanguage: LanguageCode, targetLanguage: LanguageCode) {
  if (sourceLanguage === targetLanguage) return [];
  const direct = modelForPair[`${sourceLanguage}-${targetLanguage}`];
  if (direct) return [direct];
  if (sourceLanguage === "en" || targetLanguage === "en") return [];
  const toEnglish = modelForPair[`${sourceLanguage}-en`];
  const fromEnglish = modelForPair[`en-${targetLanguage}`];
  return toEnglish && fromEnglish ? [toEnglish, fromEnglish] : [];
}

/** Downloads and browser-caches the direct model or two English-pivot models for an offline pair. */
export async function downloadTranslationModels(sourceLanguage: LanguageCode, targetLanguage: LanguageCode, onProgress?: (update: ModelDownloadProgress) => void) {
  const models = getTranslationModelPlan(sourceLanguage, targetLanguage);
  if (!models.length) throw new Error("This language pair does not have an on-device model.");
  const { env, pipeline } = await import("@huggingface/transformers");
  env.useBrowserCache = true;
  env.cacheKey = "sajilostay-translation-models";
  for (const [index, model] of models.entries()) {
    const translator = await pipeline("translation", model, {
      dtype: "q8",
      progress_callback: (update) => {
        if (update.status !== "progress" && update.status !== "progress_total") return;
        onProgress?.({ progress: Math.round(((index + update.progress / 100) / models.length) * 100), file: "file" in update ? update.file : undefined });
      },
    });
    await translator.dispose?.();
  }
  onProgress?.({ progress: 100 });
  return models.length;
}

/** Uses the already-supported English model pairs for direct Nepali/Hindi/Bengali translation. */
async function translateWithEnglishPivot(text: string, sourceLanguage: LanguageCode, targetLanguage: LanguageCode) {
  if (sourceLanguage === "en" || targetLanguage === "en") return null;
  const English = "en" as const;
  const inEnglish = await translateWithCachedModel(text, sourceLanguage, English);
  if (!inEnglish) return null;
  return translateWithCachedModel(inEnglish, English, targetLanguage);
}

/** Translation uses no cloud tier in M3. Each fallback remains usable without a network connection. */
export async function translate(text: string, sourceLanguage: LanguageCode, targetLanguage: LanguageCode): Promise<TranslationResult> {
  if (!text.trim() || sourceLanguage === targetLanguage) {
    return { text, tier: "offline-basic" };
  }

  const { requestOnlineAi } = await import("@/lib/online-ai");
  const onlineTranslation = await requestOnlineAi({ action: "translate", text, sourceLang: sourceLanguage, targetLang: targetLanguage });
  if (onlineTranslation) return { text: onlineTranslation, tier: "online-ai" };

  try {
    const translated = await translateWithChrome(text, sourceLanguage, targetLanguage);
    if (translated) return { text: translated, tier: "on-device-ai" };
  } catch {
    // The API can be present but unavailable for this language pair or device.
  }

  try {
    const translated = await translateWithCachedModel(text, sourceLanguage, targetLanguage);
    if (translated) return { text: translated, tier: "cached-model" };
  } catch {
    // An uncached model cannot load offline; use the local phrasebook instead.
  }

  try {
    const translated = await translateWithEnglishPivot(text, sourceLanguage, targetLanguage);
    if (translated) return { text: translated, tier: "cached-model", note: "Translated through English using on-device models." };
  } catch {
    // Either side of the English pivot is not cached or could not run on this device.
  }

  return translateFromPhrasebook(text, targetLanguage);
}

export const quickPhrases = Object.keys(phrasebook);
