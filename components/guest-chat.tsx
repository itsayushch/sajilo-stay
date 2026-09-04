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
    <main className="site-shell mx-auto min-h-screen max-w-lg px-4 py-6">
      <ConnectionStatus />
      <Link href="/" className="home-link inline-flex min-h-11 items-center text-sm font-bold">← Back</Link>
      <header className="mt-6"><p className="text-sm font-bold text-[#1f5d3b]">Words for welcoming guests</p><h1 className="mt-1 text-3xl font-bold">Guest chat</h1><p className="muted-copy mt-2 text-base leading-6">Translate practical guest messages, with an offline fallback.</p></header>

      <form onSubmit={submitTranslation} className="paper-panel mt-6 p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2"><label className="grid gap-1 text-sm font-bold">From<select value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value as LanguageCode)} className="min-h-12 rounded-lg border border-slate-300 px-2">{Object.entries(languages).map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label><button type="button" onClick={swapLanguages} className="mb-1 min-h-12 rounded-lg px-3 font-bold text-[#1f5d3b] underline" aria-label="Swap languages">⇄</button><label className="grid gap-1 text-sm font-bold">To<select value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value as LanguageCode)} className="min-h-12 rounded-lg border border-slate-300 px-2">{Object.entries(languages).map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label></div>
        <label className="mt-4 grid gap-1 text-sm font-bold">Message<textarea required value={text} onChange={(event) => setText(event.target.value)} rows={4} placeholder="Type or paste a guest message" className="rounded-lg border border-slate-300 px-3 py-2" /></label>
        <button type="submit" disabled={isTranslating} className="mt-4 min-h-12 rounded-lg bg-[#1f5d3b] px-4 font-bold text-white disabled:opacity-60">{isTranslating ? "Translating…" : "Translate"}</button>
      </form>

      <section className="mt-6"><h2 className="text-2xl font-bold">Quick offline phrases</h2><div className="mt-3 flex flex-wrap gap-2">{quickPhrases.slice(0, 5).map((phrase) => <button key={phrase} type="button" onClick={() => setText(phrase)} className="rounded-md border border-[#aebfb5] bg-white px-3 py-2 text-left text-sm font-semibold text-[#1f5d3b] hover:border-[#1f5d3b]">{phrase}</button>)}</div></section>

      <p className="status-line mt-5 text-sm font-bold" role="status">{status}</p>
      <section className="mt-6"><h2 className="text-2xl font-bold">Conversation</h2>{messages.length ? <ul className="mt-3 grid gap-3">{messages.map((message) => <li key={message.id} className="register-panel p-4"><div className="flex items-start justify-between gap-3"><div><p className="muted-copy text-sm font-semibold">{languages[message.originalLang as LanguageCode]} → {languages[message.translatedLang as LanguageCode]}</p><p className="mt-2">{message.originalText}</p><p className="mt-3 border-t border-[#c7d4ca] pt-3 text-lg font-bold text-[#1f5d3b]">{message.translatedText}</p></div><button type="button" onClick={() => removeMessage(message)} className="min-h-10 px-2 text-sm font-bold text-red-700 underline">Remove</button></div></li>)}</ul> : <p className="muted-copy mt-3 text-sm">No translated messages yet.</p>}</section>
    </main>
  );
}
