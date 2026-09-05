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
  "← Back": "← फर्कनुहोस्", "Expected": "अपेक्षित", "Received": "प्राप्त", "No bookings yet. Add your first guest below.": "अहिलेसम्म बुकिङ छैन। तल आफ्नो पहिलो अतिथि थप्नुहोस्।", "Edit": "सम्पादन", "Remove": "हटाउनुहोस्", "Save changes": "परिवर्तन बचत", "Cancel": "रद्द गर्नुहोस्", "Pending": "बाँकी", "Paid": "भुक्तानी भयो",
  "Turn rough home notes into a guest-ready description—even offline.": "कच्चा घरका नोटलाई अतिथिका लागि तयार विवरणमा बदल्नुहोस्—अफलाइन पनि।", "Your stay description": "तपाईंको बसाइको विवरण", "Guest-ready listing": "अतिथि-तयार विवरण", "Edit listing": "विवरण सम्पादन", "Share listing": "विवरण साझेदारी", "Delete listing": "विवरण मेटाउनुहोस्",
  "Name each guest room, write a clear description, and keep availability current.": "प्रत्येक अतिथि कोठाको नाम राख्नुहोस्, स्पष्ट विवरण लेख्नुहोस् र उपलब्धता अद्यावधिक राख्नुहोस्।", "Your rooms": "तपाईंका कोठाहरू", "Available": "उपलब्ध", "Occupied": "भरिएको", "Maintenance": "मर्मत", "Rough room notes": "कोठाका कच्चा नोटहरू", "Write description with Lite AI": "Lite AI बाट विवरण लेख्नुहोस्", "Suggested nightly price": "सुझाव गरिएको रातको मूल्य", "Delete": "मेटाउनुहोस्",
  "A simple guide for a safe, welcoming stay.": "सुरक्षित र आत्मीय बसाइका लागि सरल मार्गदर्शन।", "Clean guest room": "सफा अतिथि कोठा", "Safety basics": "सुरक्षाका आधारहरू", "Guest information sheet": "अतिथि जानकारी पाना", "Emergency contacts": "आपतकालीन सम्पर्कहरू", "Connectivity information": "कनेक्सन जानकारी",
  "Paste a guest's message, translate your reply, then copy or share it through WhatsApp or SMS.": "अतिथिको सन्देश टाँस्नुहोस्, आफ्नो जवाफ अनुवाद गर्नुहोस्, अनि WhatsApp वा SMS बाट प्रतिलिपि वा साझेदारी गर्नुहोस्।", "Your Nepali reply": "तपाईंको नेपाली जवाफ", "Guest message": "अतिथिको सन्देश", "Translate reply": "जवाफ अनुवाद", "Translate for host": "होस्टका लागि अनुवाद", "Quick replies": "छिटो जवाफ", "Common guest messages": "सामान्य अतिथि सन्देशहरू", "Saved messages": "बचत गरिएका सन्देशहरू",
};

type LanguageContextValue = { language: AppLanguage; setLanguage: (language: AppLanguage) => void; t: (english: string) => string };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function AppLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>("en");
  useEffect(() => { const saved = window.localStorage.getItem("sajilostay-app-language"); if (saved === "ne" || saved === "en") setLanguage(saved); }, []);
  const value = useMemo(() => ({ language, setLanguage: (next: AppLanguage) => { setLanguage(next); window.localStorage.setItem("sajilostay-app-language", next); }, t: (english: string) => language === "ne" ? nepali[english] ?? english : english }), [language]);
  useEffect(() => {
    const reverse = Object.fromEntries(Object.entries(nepali).map(([english, translated]) => [translated, english]));
    const translateNode = (node: Text) => {
      const original = node.nodeValue ?? "";
      const trimmed = original.trim();
      const replacement = language === "ne" ? nepali[trimmed] : reverse[trimmed];
      if (replacement) node.nodeValue = original.replace(trimmed, replacement);
    };
    const translateTree = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      while (walker.nextNode()) nodes.push(walker.currentNode as Text);
      nodes.forEach(translateNode);
      if (root instanceof Element) root.querySelectorAll<HTMLElement>("[placeholder],[aria-label]").forEach((element) => {
        for (const attribute of ["placeholder", "aria-label"]) { const current = element.getAttribute(attribute); const replacement = current && (language === "ne" ? nepali[current] : reverse[current]); if (replacement) element.setAttribute(attribute, replacement); }
      });
    };
    translateTree(document.body);
    const observer = new MutationObserver((mutations) => mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => translateTree(node))));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useAppLanguage() { const value = useContext(LanguageContext); if (!value) throw new Error("useAppLanguage must be used inside AppLanguageProvider"); return value; }

export function LanguageSwitcher() {
  const { language, setLanguage } = useAppLanguage();
  return <div className="fixed bottom-4 right-4 z-50 rounded-full border border-[#b9d4de] bg-white p-1 shadow-[0_8px_20px_rgba(15,73,98,0.16)]">
    <div className="flex items-center gap-1" aria-label="App language">
      <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8edf4] text-base font-extrabold text-[#103e55]">अ</span>
      <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")} className={`min-h-9 rounded-full px-3.5 text-sm font-black transition-colors ${language === "en" ? "bg-[#103e55] text-white shadow-sm" : "bg-white text-[#103e55] hover:bg-[#d8edf4]"}`}>English</button>
      <button type="button" aria-pressed={language === "ne"} onClick={() => setLanguage("ne")} className={`min-h-9 rounded-full px-3.5 text-sm font-black transition-colors ${language === "ne" ? "bg-[#103e55] text-white shadow-sm" : "bg-white text-[#103e55] hover:bg-[#d8edf4]"}`}>नेपाली</button>
    </div>
  </div>;
}
