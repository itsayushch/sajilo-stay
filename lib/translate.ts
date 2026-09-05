export const languages = {
  en: "English",
  ne: "Nepali",
  hi: "Hindi",
  bn: "Bengali",
} as const;

export type LanguageCode = keyof typeof languages;
export type TranslationTier = "online-ai" | "on-device-ai" | "offline-basic";

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
  "would you like to book this room?": { ne: "के तपाईं यो कोठा बुक गर्न चाहनुहुन्छ?", hi: "क्या आप यह कमरा बुक करना चाहेंगे?", bn: "আপনি কি এই ঘরটি বুক করতে চান?" },
  "please send your check-in and check-out dates.": { ne: "कृपया आफ्नो चेक-इन र चेक-आउट मिति पठाउनुहोस्।", hi: "कृपया अपनी चेक-इन और चेक-आउट तारीख भेजें।", bn: "অনুগ্রহ করে আপনার চেক-ইন ও চেক-আউটের তারিখ পাঠান।" },
  "a deposit is needed to confirm the booking.": { ne: "बुकिङ पुष्टि गर्न अग्रिम रकम आवश्यक छ।", hi: "बुकिंग पक्की करने के लिए अग्रिम राशि आवश्यक है।", bn: "বুকিং নিশ্চিত করতে অগ্রিম টাকা লাগবে।" },
  "payment can be made by cash or upi.": { ne: "भुक्तानी नगद वा यूपीआईबाट गर्न सकिन्छ।", hi: "भुगतान नकद या यूपीआई से किया जा सकता है।", bn: "নগদ বা ইউপিআই দিয়ে পেমেন্ট করা যায়।" },
  "your booking is confirmed.": { ne: "तपाईंको बुकिङ पुष्टि भयो।", hi: "आपकी बुकिंग पक्की हो गई है।", bn: "আপনার বুকিং নিশ্চিত হয়েছে।" },
  "please call us when you reach the village.": { ne: "गाउँ पुग्नुभयो भने कृपया हामीलाई फोन गर्नुहोस्।", hi: "गाँव पहुँचने पर कृपया हमें फोन करें।", bn: "গ্রামে পৌঁছালে অনুগ্রহ করে আমাদের ফোন করুন।" },
  "we can help arrange a taxi.": { ne: "हामी ट्याक्सी मिलाउन मद्दत गर्न सक्छौं।", hi: "हम टैक्सी की व्यवस्था में मदद कर सकते हैं।", bn: "আমরা ট্যাক্সির ব্যবস্থা করতে সাহায্য করতে পারি।" },
  "the nearest market is nearby.": { ne: "नजिकै बजार छ।", hi: "पास में बाजार है।", bn: "কাছেই বাজার আছে।" },
  "there is mobile network here.": { ne: "यहाँ मोबाइल नेटवर्क छ।", hi: "यहाँ मोबाइल नेटवर्क है।", bn: "এখানে মোবাইল নেটওয়ার্ক আছে।" },
  "please tell us if you have any food allergies.": { ne: "कुनै खानेकुराको एलर्जी छ भने कृपया हामीलाई भन्नुहोस्।", hi: "अगर आपको खाने से कोई एलर्जी है तो कृपया हमें बताएं।", bn: "খাবারে কোনো অ্যালার্জি থাকলে অনুগ্রহ করে আমাদের জানান।" },
  "hot water is available in the morning and evening.": { ne: "बिहान र बेलुका तातो पानी उपलब्ध छ।", hi: "सुबह और शाम गर्म पानी उपलब्ध है।", bn: "সকাল ও সন্ধ্যায় গরম পানি পাওয়া যায়।" },
  "wifi is available in common areas.": { ne: "साझा ठाउँमा वाइफाइ उपलब्ध छ।", hi: "साझा जगहों में वाई-फाई उपलब्ध है।", bn: "সাধারণ এলাকায় ওয়াই-ফাই পাওয়া যায়।" },
  "please keep noise low after 9 pm.": { ne: "कृपया राति ९ बजेपछि आवाज कम राख्नुहोस्।", hi: "कृपया रात 9 बजे के बाद आवाज कम रखें।", bn: "রাত ৯টার পরে অনুগ্রহ করে আওয়াজ কম রাখুন।" },
  "smoking is not allowed inside.": { ne: "भित्र धुम्रपान गर्न अनुमति छैन।", hi: "अंदर धूम्रपान की अनुमति नहीं है।", bn: "ভেতরে ধূমপান করা যাবে না।" },
  "please let us know if you need anything.": { ne: "कुनै कुरा चाहिएको छ भने कृपया हामीलाई भन्नुहोस्।", hi: "अगर आपको कुछ चाहिए तो कृपया हमें बताएं।", bn: "কিছু প্রয়োজন হলে অনুগ্রহ করে আমাদের জানান।" },
};

export const offlinePhrasePacks = [
  { id: "booking", label: "बुकिङ र भुक्तानी", phrases: ["कोठा उपलब्ध छ?", "के तपाईं यो कोठा बुक गर्न चाहनुहुन्छ?", "कृपया आफ्नो चेक-इन र चेक-आउट मिति पठाउनुहोस्।", "बुकिङ पुष्टि गर्न अग्रिम रकम आवश्यक छ।", "भुक्तानी नगद वा यूपीआईबाट गर्न सकिन्छ।", "तपाईंको बुकिङ पुष्टि भयो।"] },
  { id: "arrival", label: "आगमन र बाटो", phrases: ["म त्यहाँ कसरी पुग्न सक्छु?", "कृपया बेलुका ८ बजेअघि आइपुग्नुहोस्।", "गाउँ पुग्नुभयो भने कृपया हामीलाई फोन गर्नुहोस्।", "हामी ट्याक्सी मिलाउन मद्दत गर्न सक्छौं।", "नजिकै बजार छ।", "यहाँ मोबाइल नेटवर्क छ।"] },
  { id: "stay", label: "बसाइँका बेला", phrases: ["खाना उपलब्ध छ?", "बिहानको खाजा र बेलुकाको खाना उपलब्ध छ।", "बिहान र बेलुका तातो पानी उपलब्ध छ।", "साझा ठाउँमा वाइफाइ उपलब्ध छ।", "कुनै खानेकुराको एलर्जी छ भने कृपया हामीलाई भन्नुहोस्।", "कुनै कुरा चाहिएको छ भने कृपया हामीलाई भन्नुहोस्।"] },
  { id: "rules", label: "घरका नियम", phrases: ["घरका नियमहरू के हुन्?", "कृपया भित्र जुत्ता खोल्नुहोस्।", "कृपया राति ९ बजेपछि आवाज कम राख्नुहोस्।", "भित्र धुम्रपान गर्न अनुमति छैन।"] },
] as const;

function normalize(text: string) {
  return text.trim().toLocaleLowerCase();
}

function translateFromPhrasebook(text: string, targetLanguage: LanguageCode): TranslationResult {
  const key = normalize(text);
  const priceMatch = text.trim().match(/^the price is\s*₹?\s*([\d,]+)\s*per night\.?$/i);
  if (priceMatch) {
    const amount = priceMatch[1];
    const templates: Partial<Record<LanguageCode, string>> = { ne: `मूल्य प्रति रात रु ${amount} हो।`, hi: `कीमत ₹${amount} प्रति रात है।`, bn: `প্রতি রাতের ভাড়া ₹${amount}।` };
    if (templates[targetLanguage]) return { text: templates[targetLanguage]!, tier: "offline-basic" };
  }
  const nepaliPriceMatch = text.trim().match(/^मूल्य प्रति रात रु\s*([\d,]+)\s*हो।?$/);
  if (nepaliPriceMatch) {
    const amount = nepaliPriceMatch[1];
    const templates: Partial<Record<LanguageCode, string>> = { en: `The price is ₹${amount} per night.`, hi: `कीमत ₹${amount} प्रति रात है।`, bn: `প্রতি রাতের ভাড়া ₹${amount}।` };
    if (templates[targetLanguage]) return { text: templates[targetLanguage]!, tier: "offline-basic" };
  }
  const dateMatch = text.trim().match(/^please arrive on\s+(.+?)\.?$/i);
  if (dateMatch) {
    const date = dateMatch[1];
    const templates: Partial<Record<LanguageCode, string>> = { ne: `कृपया ${date} मा आइपुग्नुहोस्।`, hi: `कृपया ${date} को पहुँचें।`, bn: `অনুগ্রহ করে ${date}-এ পৌঁছান।` };
    if (templates[targetLanguage]) return { text: templates[targetLanguage]!, tier: "offline-basic" };
  }
  const nepaliDateMatch = text.trim().match(/^कृपया\s+(.+?)\s+मा आइपुग्नुहोस्।?$/);
  if (nepaliDateMatch) {
    const date = nepaliDateMatch[1];
    const templates: Partial<Record<LanguageCode, string>> = { en: `Please arrive on ${date}.`, hi: `कृपया ${date} को पहुँचें।`, bn: `অনুগ্রহ করে ${date}-এ পৌঁছান।` };
    if (templates[targetLanguage]) return { text: templates[targetLanguage]!, tier: "offline-basic" };
  }
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

/** Translation uses online AI when available, with browser and phrasebook fallbacks. */
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

  return translateFromPhrasebook(text, targetLanguage);
}

export const quickPhrases = Object.keys(phrasebook);
