"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Message, deleteMessage, getMessages, saveMessage } from "@/lib/db";
import { LanguageCode, TranslationResult, languages, quickPhrases, translate } from "@/lib/translate";
import { ConnectionStatus } from "@/components/connection-status";

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `message-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function tierLabel(tier: TranslationResult["tier"]) {
  return { "online-ai": "Online AI", "on-device-ai": "On-device AI", "cached-model": "Cached on-device model", "offline-basic": "Offline basic" }[tier];
}

export function GuestChat() {
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>("ne");
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>("en");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState("Loading saved conversations…");
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    getMessages()
      .then((savedMessages) => {
        setMessages(savedMessages.reverse());
        setStatus(savedMessages.length ? "" : "Your translations stay on this phone.");
      })
      .catch(() => setStatus("Could not open saved conversations. Please try again."));
  }, []);

  function swapLanguages() {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
  }

  async function submitTranslation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim()) return;
    setIsTranslating(true);
    setStatus("Translating on this device…");
    const originalText = text.trim();

    try {
      const result = await translate(originalText, sourceLanguage, targetLanguage);
      const message: Message = {
        id: createId(),
        originalText,
        originalLang: sourceLanguage,
        translatedText: result.text,
        translatedLang: targetLanguage,
        timestamp: new Date().toISOString(),
      };
      setMessages((current) => [message, ...current]);
      setText("");
      setStatus(`${tierLabel(result.tier)} · saved offline.${result.note ? ` ${result.note}` : ""}`);
      try {
        await saveMessage(message);
      } catch {
        setMessages((current) => current.filter((item) => item.id !== message.id));
        setStatus("Could not save this translation. Your previous conversations are safe.");
      }
    } catch {
      setStatus("Could not translate this message. Try a short saved phrase while offline.");
    } finally {
      setIsTranslating(false);
    }
  }

  async function removeMessage(message: Message) {
    const previousMessages = messages;
    setMessages((current) => current.filter((item) => item.id !== message.id));
    setStatus("Message removed.");
    try {
      await deleteMessage(message.id);
    } catch {
      setMessages(previousMessages);
      setStatus("Could not remove this message. Your saved conversation is unchanged.");
    }
  }

  return (
    <main className="site-shell mx-auto min-h-screen max-w-lg px-4 py-6 sm:px-5">
      <ConnectionStatus />
      <Link href="/" className="home-link inline-flex min-h-11 items-center text-sm font-bold">← Back</Link>
      <header className="mt-6"><p className="inline-flex rounded-full border border-[#b7d7e2] bg-white/80 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#15506d]">Guest messages</p><h1 className="mt-3 text-3xl font-extrabold">Guest chat</h1><p className="muted-copy mt-2 max-w-sm text-sm leading-6">Translate practical messages, even when this phone is offline.</p></header>

      <form onSubmit={submitTranslation} className="paper-panel mt-6 p-4 sm:p-5">
        <fieldset><legend className="text-sm font-extrabold text-[#162338]">Choose languages</legend><div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-end gap-2"><label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-[0.08em] text-[#5e7085]">From<select value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value as LanguageCode)} className="min-h-10 rounded-lg border-[#c9d9df] bg-[#fbfdfd] px-2.5 text-sm font-bold text-[#162338] shadow-none">{Object.entries(languages).map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label><button type="button" onClick={swapLanguages} className="mb-0.5 flex min-h-10 w-10 items-center justify-center rounded-lg !border-[#b7d7e2] !bg-[#eaf5f8] p-0 text-base font-extrabold !text-[#15506d] !shadow-none hover:!bg-[#d8edf4]" aria-label="Swap languages">⇄</button><label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-[0.08em] text-[#5e7085]">To<select value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value as LanguageCode)} className="min-h-10 rounded-lg border-[#c9d9df] bg-[#fbfdfd] px-2.5 text-sm font-bold text-[#162338] shadow-none">{Object.entries(languages).map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label></div></fieldset>
        <label className="mt-5 grid gap-1.5 text-sm font-extrabold text-[#162338]">What would you like to say?<textarea required value={text} onChange={(event) => setText(event.target.value)} rows={4} placeholder="Type or paste a guest message" className="resize-y rounded-xl border-[#c9d9df] bg-[#fbfdfd] px-3 py-3 text-sm leading-6 shadow-none" /></label>
        <div className="mt-4 flex items-center justify-between gap-3"><p className="text-xs leading-5 text-[#5e7085]">Your translation is saved on this phone.</p><button type="submit" disabled={isTranslating} className="min-h-10 shrink-0 rounded-lg bg-[#15506d] px-4 text-sm font-extrabold text-white disabled:opacity-60">{isTranslating ? "Translating…" : "Translate →"}</button></div>
      </form>

      <section className="mt-5 rounded-2xl border border-[#d6e4dd] bg-[#f4faf7] p-4"><div className="flex items-baseline justify-between gap-3"><h2 className="text-base font-extrabold">Quick phrases</h2><span className="text-xs font-bold text-[#4e7568]">Works offline</span></div><p className="mt-1 text-xs leading-5 text-[#5e7085]">Tap one to place it in the message box.</p><div className="mt-3 flex flex-wrap gap-2">{quickPhrases.slice(0, 5).map((phrase) => <button key={phrase} type="button" onClick={() => setText(phrase)} className="min-h-9 rounded-full !border-[#b8d5c8] !bg-white px-3 py-1.5 text-left text-xs font-bold !text-[#17634d] !shadow-none hover:!border-[#76a993] hover:!bg-[#fafffc]">{phrase}</button>)}</div></section>

      {status && <p className="status-line mt-4 rounded-lg border border-[#cfe1da] bg-white/70 px-3 py-2 text-xs font-bold" role="status">{status}</p>}
      <section className="mt-6 pb-6"><div className="flex items-baseline justify-between"><h2 className="text-xl font-extrabold">Saved translations</h2>{messages.length ? <span className="text-xs font-bold text-[#5e7085]">{messages.length}</span> : null}</div>{messages.length ? <ul className="mt-3 grid gap-3">{messages.map((message) => <li key={message.id} className="register-panel p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0 flex-1"><p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#5e7085]">{languages[message.originalLang as LanguageCode]} → {languages[message.translatedLang as LanguageCode]}</p><p className="mt-2 text-sm leading-6 text-[#35465b]">{message.originalText}</p><p className="mt-3 border-t border-[#dce8e8] pt-3 text-base font-extrabold leading-6 text-[#15506d]">{message.translatedText}</p></div><button type="button" onClick={() => removeMessage(message)} className="min-h-9 rounded-md !bg-transparent px-2 text-xs font-bold !text-red-700 !shadow-none underline decoration-red-300 underline-offset-2 hover:!bg-red-50">Remove</button></div></li>)}</ul> : <div className="mt-3 rounded-xl border border-dashed border-[#c8dce0] bg-white/50 px-4 py-5 text-center"><p className="text-sm font-bold text-[#35465b]">No saved translations yet.</p><p className="mt-1 text-xs leading-5 text-[#5e7085]">Your translated messages will appear here for easy reuse.</p></div>}</section>
    </main>
  );
}
