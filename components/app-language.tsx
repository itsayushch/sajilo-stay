"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppLanguage = "en" | "ne";

const nepali: Record<string, string> = {
  "Settings": "सेटिङहरू", "Back": "फर्कनुहोस्", "Online": "अनलाइन", "Offline": "अफलाइन",
  "Bookings & cash": "बुकिङ र हिसाब", "Write your stay": "आफ्नो बसाइ लेख्नुहोस्", "Guest messages": "अतिथि सन्देशहरू", "Manage rooms": "कोठा व्यवस्थापन", "Readiness checklist": "तयारी सूची",
  "Hosting today": "आजको होस्टिङ", "Your calm, private workspace for every guest stay.": "हरेक अतिथि बसाइका लागि तपाईंको निजी कार्यस्थल।",
  "Keep guest dates, payments, and a shareable ledger in one place.": "अतिथिको मिति, भुक्तानी र हिसाब एकै ठाउँमा राख्नुहोस्।",
  "Shape a clear guest listing.": "अतिथिका लागि स्पष्ट विवरण बनाउनुहोस्।", "Translate, copy, and share replies.": "जवाफ अनुवाद, प्रतिलिपि र साझेदारी गर्नुहोस्।",
  "Name rooms and update availability.": "कोठाको नाम र उपलब्धता अद्यावधिक गर्नुहोस्।", "Make every stay feel prepared.": "हरेक बसाइलाई तयार बनाउनुहोस्।",
  "Make the app yours": "एपलाई आफ्नो बनाउनुहोस्", "Sajilo Stay uses online AI when a connection is available and falls back to offline tools when it is not.": "Sajilo Stay ले इन्टरनेट हुँदा अनलाइन AI र नभए अफलाइन उपकरण प्रयोग गर्छ।",
  "Your homestay profile": "तपाईंको होमस्टे प्रोफाइल", "Save profile changes": "प्रोफाइल परिवर्तन बचत गर्नुहोस्", "Loading settings…": "सेटिङहरू लोड हुँदैछ…",
  "Your hosting register": "तपाईंको होस्टिङ हिसाब", "Keep guest dates and payments safely on this phone.": "अतिथि मिति र भुक्तानी यस फोनमा सुरक्षित राख्नुहोस्।",
  "Your bookings": "तपाईंका बुकिङहरू", "Add a booking": "बुकिङ थप्नुहोस्", "Export CSV": "CSV निकाल्नुहोस्", "Guest name": "अतिथिको नाम", "Check-in": "चेक-इन", "Check-out": "चेक-आउट", "Amount (₹)": "रकम (₹)", "Payment": "भुक्तानी", "Notes (optional)": "टिप्पणी (वैकल्पिक)", "Add booking": "बुकिङ थप्नुहोस्",
  "Tell guests about your home": "अतिथिलाई आफ्नो घरबारे बताउनुहोस्", "Your rough notes": "तपाईंका कच्चा नोटहरू", "Generate description": "विवरण बनाउनुहोस्", "Update description": "विवरण अद्यावधिक गर्नुहोस्", "Save listing": "विवरण बचत गर्नुहोस्",
  "Your home, room by room": "तपाईंको घर, कोठा अनुसार", "Rooms": "कोठाहरू", "Add a room": "कोठा थप्नुहोस्", "Room name": "कोठाको नाम", "Guest capacity": "अतिथि क्षमता", "Availability": "उपलब्धता", "Save room": "कोठा बचत गर्नुहोस्",
  "Before guests arrive": "अतिथि आउनुअघि", "Hosting checklist": "होस्टिङ तयारी सूची", "Guest Message Helper": "अतिथि सन्देश सहायक", "Send to guest": "अतिथिलाई पठाउनुहोस्", "Understand guest": "अतिथिलाई बुझ्नुहोस्",
};

type LanguageContextValue = { language: AppLanguage; setLanguage: (language: AppLanguage) => void; t: (english: string) => string };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function AppLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>("en");
  useEffect(() => { const saved = window.localStorage.getItem("sajilostay-app-language"); if (saved === "ne" || saved === "en") setLanguage(saved); }, []);
  const value = useMemo(() => ({ language, setLanguage: (next: AppLanguage) => { setLanguage(next); window.localStorage.setItem("sajilostay-app-language", next); }, t: (english: string) => language === "ne" ? nepali[english] ?? english : english }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useAppLanguage() { const value = useContext(LanguageContext); if (!value) throw new Error("useAppLanguage must be used inside AppLanguageProvider"); return value; }

export function LanguageSwitcher() {
  const { language, setLanguage } = useAppLanguage();
  return <div className="fixed right-4 top-14 z-50 rounded-full border border-[#c7dce3] bg-white/95 p-1 shadow-[0_8px_22px_rgba(15,73,98,0.14)] backdrop-blur">
    <div className="flex items-center gap-1" aria-label="App language">
      <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf5f8] text-sm text-[#15506d]">अ</span>
      <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")} className={`min-h-8 rounded-full px-3 text-xs font-extrabold transition-colors ${language === "en" ? "bg-[#15506d] text-white shadow-sm" : "text-[#5e7085] hover:bg-[#eef8fb] hover:text-[#15506d]"}`}>English</button>
      <button type="button" aria-pressed={language === "ne"} onClick={() => setLanguage("ne")} className={`min-h-8 rounded-full px-3 text-xs font-extrabold transition-colors ${language === "ne" ? "bg-[#15506d] text-white shadow-sm" : "text-[#5e7085] hover:bg-[#eef8fb] hover:text-[#15506d]"}`}>नेपाली</button>
    </div>
  </div>;
}
