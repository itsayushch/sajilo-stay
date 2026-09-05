"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Message, deleteMessage, getMessages, saveMessage } from "@/lib/db";
import { LanguageCode, TranslationResult, languages, offlinePhrasePacks, romanizedPhrases, translate } from "@/lib/translate";
import { ConnectionStatus } from "@/components/connection-status";

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `message-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function tierLabel(tier: TranslationResult["tier"]) {
  return { "online-ai": "Online AI", "on-device-ai": "On-device AI", "offline-basic": "Offline basic" }[tier];
}

export function GuestChat() {
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>("ne");
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>("en");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState("Loading saved conversations…");
  const [isTranslating, setIsTranslating] = useState(false);
  const [activePack, setActivePack] = useState<(typeof offlinePhrasePacks)[number]["id"]>("booking");
  const [quickPrice, setQuickPrice] = useState("");
  const [quickDate, setQuickDate] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [messageKind, setMessageKind] = useState<"host-reply" | "guest-message">("host-reply");

  useEffect(() => {
    getMessages()
      .then((savedMessages) => {
        setMessages(savedMessages.reverse());
        setStatus(savedMessages.length ? "" : "Your translations stay on this phone.");
      })
      .catch(() => setStatus("Could not open saved conversations. Please try again."));
  }, []);

  function chooseMessageKind(kind: "host-reply" | "guest-message") {
    setMessageKind(kind);
    if (kind === "host-reply") {
      setSourceLanguage("ne");
      setTargetLanguage((current) => current === "ne" ? "en" : current);
    } else {
      setTargetLanguage("ne");
      setSourceLanguage((current) => current === "ne" ? "en" : current);
    }
  }

  function useQuickPhrase(phrase: string) {
    setText(phrase);
    setSourceLanguage("ne");
    if (targetLanguage === "ne") setTargetLanguage("en");
  }

  function useTemplate(value: string) {
    const price = value.match(/^The price is ₹(.+) per night\.$/);
    const date = value.match(/^Please arrive on (.+)\.$/);
    useQuickPhrase(price ? `मूल्य प्रति रात रु ${price[1]} हो।` : date ? `कृपया ${date[1]} मा आइपुग्नुहोस्।` : value);
  }

  function isGuestMessage(message: Message) {
    return message.kind === "guest-message" || (!message.kind && message.translatedLang === "ne");
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
        kind: messageKind,
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

  async function copyReply(message: Message) {
    try {
      await navigator.clipboard.writeText(message.translatedText);
      setStatus("Reply copied. Paste it into WhatsApp, SMS, or another messaging app.");
    } catch {
      setStatus("Could not copy the reply. Select the text and copy it manually.");
    }
  }

  async function shareReply(message: Message) {
    if (!navigator.share) {
      await copyReply(message);
      return;
    }
    try {
      await navigator.share({ title: "Sajilo Stay guest reply", text: message.translatedText });
      setStatus("Reply ready to send.");
    } catch {
      setStatus("Sharing was cancelled. Your reply is still saved here.");
    }
  }

  return (
    <main className="site-shell mx-auto flex min-h-screen max-w-lg flex-col px-4 py-6 sm:px-5">
      <ConnectionStatus />
      <Link href="/" className="home-link inline-flex min-h-11 items-center text-sm font-bold">← Back</Link>
      <header className="mt-6"><p className="inline-flex rounded-full border border-[#b7d7e2] bg-white/80 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#15506d]">Guest messages</p><h1 className="mt-3 text-3xl font-extrabold">Guest Message Helper</h1><p className="muted-copy mt-2 max-w-sm text-sm leading-6">Paste a guest&apos;s message, translate your reply, then copy or share it through WhatsApp or SMS.</p></header>

      <section className="order-2 mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={() => chooseMessageKind("host-reply")} className={`min-h-24 rounded-xl p-3 text-left !shadow-none ${messageKind === "host-reply" ? "!border-[#15506d] !bg-[#15506d] !text-white" : "!border-[#b7d7e2] !bg-white !text-[#15506d]"}`}><span className="block text-sm font-extrabold">Send to guest</span><span className={`mt-1 block text-xs leading-5 ${messageKind === "host-reply" ? "text-[#d8edf4]" : "text-[#5e7085]"}`}>Nepali → guest language</span></button><button type="button" onClick={() => chooseMessageKind("guest-message")} className={`min-h-24 rounded-xl p-3 text-left !shadow-none ${messageKind === "guest-message" ? "!border-[#17634d] !bg-[#17634d] !text-white" : "!border-[#b8d5c8] !bg-white !text-[#17634d]"}`}><span className="block text-sm font-extrabold">Understand guest</span><span className={`mt-1 block text-xs leading-5 ${messageKind === "guest-message" ? "text-[#d8eee4]" : "text-[#5e7085]"}`}>Guest language → Nepali</span></button></section>

      <form onSubmit={submitTranslation} className="order-2 paper-panel mt-4 p-4 sm:p-5">
        <fieldset>
          <legend className="text-sm font-extrabold text-[#162338]">Languages</legend>
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-[0.08em] text-[#5e7085]">From
              <select value={sourceLanguage} disabled={messageKind === "host-reply"} onChange={(event) => setSourceLanguage(event.target.value as LanguageCode)} className="min-h-10 rounded-lg border-[#c9d9df] bg-[#fbfdfd] px-2.5 text-sm font-bold text-[#162338] shadow-none disabled:cursor-not-allowed disabled:bg-[#eef4f5] disabled:text-[#5e7085]">{Object.entries(languages).filter(([code]) => messageKind === "host-reply" ? code === "ne" : code !== "ne").map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select>
            </label>
            <span aria-hidden="true" className="mb-2 text-lg font-extrabold text-[#5e7085]">→</span>
            <label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-[0.08em] text-[#5e7085]">To
              <select value={targetLanguage} disabled={messageKind === "guest-message"} onChange={(event) => setTargetLanguage(event.target.value as LanguageCode)} className="min-h-10 rounded-lg border-[#c9d9df] bg-[#fbfdfd] px-2.5 text-sm font-bold text-[#162338] shadow-none disabled:cursor-not-allowed disabled:bg-[#eef4f5] disabled:text-[#5e7085]">{Object.entries(languages).filter(([code]) => messageKind === "guest-message" ? code === "ne" : code !== "ne").map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select>
            </label>
          </div>
        </fieldset>
        <label className="mt-5 grid gap-1.5 text-sm font-extrabold text-[#162338]">{messageKind === "host-reply" ? "Your Nepali reply" : "Guest message"}<textarea required value={text} onChange={(event) => setText(event.target.value)} rows={4} placeholder={messageKind === "host-reply" ? "Write a Nepali reply or choose a phrase below" : "Paste or type the guest’s message"} className="resize-y rounded-xl border-[#c9d9df] bg-[#fbfdfd] px-3 py-3 text-sm leading-6 shadow-none" /></label>
        <div className="mt-4 flex items-center justify-between gap-3"><p className="text-xs leading-5 text-[#5e7085]">{messageKind === "host-reply" ? "Use a saved phrase offline, then copy or share the reply." : "The Nepali translation is saved for the host’s reference."}</p><button type="submit" disabled={isTranslating} className="min-h-10 shrink-0 rounded-lg !bg-[#15506d] px-4 text-sm font-extrabold !text-white disabled:opacity-60">{isTranslating ? "Translating…" : messageKind === "host-reply" ? "Translate reply" : "Translate for host"}</button></div>
      </form>

      {messageKind === "host-reply" && (
        <section className="order-3 mt-4 rounded-2xl border border-[#cce3db] bg-[#f4faf7] p-4">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="text-base font-extrabold">Quick replies</h2><p className="mt-1 text-xs text-[#4e7568]">Nepali messages you can translate even without data</p></div>
            <button type="button" onClick={() => setShowQuickReplies((current) => !current)} className="min-h-9 rounded-lg !border-[#b8d5c8] !bg-white px-3 text-xs font-extrabold !text-[#17634d] !shadow-none">{showQuickReplies ? "Close" : "Browse replies"}</button>
          </div>
          {showQuickReplies && <>
            <div className="mt-4"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#17634d]">1 · Choose a topic</p><div className="mt-2 grid grid-cols-2 gap-2">{offlinePhrasePacks.map((pack) => <button key={pack.id} type="button" onClick={() => setActivePack(pack.id)} className={`min-h-10 rounded-lg px-3 text-left text-xs font-extrabold !shadow-none ${activePack === pack.id ? "!border-[#17634d] !bg-[#17634d] !text-white" : "!border-[#b8d5c8] !bg-[#e8f4ed] !text-[#17634d] hover:!bg-[#dcefe4]"}`}>{pack.label}</button>)}</div></div>
            <div className="mt-4 border-t border-[#d4e5dc] pt-4"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#17634d]">2 · Choose a message</p><div className="mt-2 grid gap-2">{offlinePhrasePacks.find((pack) => pack.id === activePack)?.phrases.map((phrase) => <button key={phrase} type="button" onClick={() => { useQuickPhrase(phrase); setShowQuickReplies(false); }} className="min-h-10 rounded-lg !border-[#b8d5c8] !bg-white px-3 py-2 text-left text-sm font-bold !text-[#17634d] !shadow-none hover:!border-[#76a993] hover:!bg-[#fafffc]"><span className="block">{phrase}</span><span className="mt-0.5 block text-xs font-medium text-[#5e7085]">({romanizedPhrases[phrase]})</span></button>)}</div></div>
            <div className="mt-4 grid gap-2 border-t border-[#d4e5dc] pt-3"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#17634d]">Or add a detail</p><div className="grid grid-cols-[1fr_auto] gap-2"><input value={quickPrice} onChange={(event) => setQuickPrice(event.target.value)} inputMode="numeric" placeholder="Nightly price, e.g. 2500" className="min-h-9 rounded-lg border-[#b8d5c8] bg-white px-2 text-xs" /><button type="button" disabled={!quickPrice.trim()} onClick={() => useTemplate(`The price is ₹${quickPrice.trim()} per night.`)} className="min-h-9 rounded-lg !border-[#b8d5c8] !bg-white px-2 text-xs font-extrabold !text-[#17634d] !shadow-none">Use price</button></div><div className="grid grid-cols-[1fr_auto] gap-2"><input value={quickDate} onChange={(event) => setQuickDate(event.target.value)} placeholder="Arrival date, e.g. 12 October" className="min-h-9 rounded-lg border-[#b8d5c8] bg-white px-2 text-xs" /><button type="button" disabled={!quickDate.trim()} onClick={() => useTemplate(`Please arrive on ${quickDate.trim()}.`)} className="min-h-9 rounded-lg !border-[#b8d5c8] !bg-white px-2 text-xs font-extrabold !text-[#17634d] !shadow-none">Use date</button></div></div>
          </>}
        </section>
      )}

      {status && <p className="order-4 status-line mt-4 rounded-lg border border-[#cfe1da] bg-white/70 px-3 py-2 text-xs font-bold" role="status">{status}</p>}
      <section className="order-5 mt-6 pb-6">
        <div className="flex items-baseline justify-between"><h2 className="text-xl font-extrabold">Saved messages</h2>{messages.length ? <span className="text-xs font-bold text-[#5e7085]">{messages.length}</span> : null}</div>
        {messages.length ? <ul className="mt-3 grid gap-3">{messages.map((message) => {
          const received = isGuestMessage(message);
          return <li key={message.id} className="register-panel p-4"><div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#5e7085]">{received ? "Guest message · Nepali reference" : "Host reply · ready to send"}</p>
            <p className="mt-1 text-xs font-bold text-[#5e7085]">{languages[message.originalLang as LanguageCode]} → {languages[message.translatedLang as LanguageCode]}</p>
            <div className="mt-2 rounded-xl rounded-tl-sm bg-[#f0f5f7] px-3 py-2 text-sm leading-6 text-[#35465b]">{message.originalText}</div>
            <div className="mt-2 rounded-xl rounded-tr-sm bg-[#e5f3ee] px-3 py-2 text-base font-extrabold leading-6 text-[#17634d]">{message.translatedText}</div>
            <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => copyReply(message)} className="min-h-9 rounded-md !border-[#9dbec9] !bg-white px-3 text-xs font-bold !text-[#15506d] !shadow-none hover:!bg-[#eef8fb]">{received ? "Copy Nepali" : "Copy reply"}</button>{!received && <button type="button" onClick={() => shareReply(message)} className="min-h-9 rounded-md !bg-[#15506d] px-3 text-xs font-bold !text-white">Share reply</button>}<button type="button" onClick={() => removeMessage(message)} className="min-h-9 rounded-md !border-red-200 !bg-red-50 px-3 text-xs font-bold !text-red-700 !shadow-none hover:!bg-red-100">Remove</button></div>
          </div></li>;
        })}</ul> : <div className="mt-3 rounded-xl border border-dashed border-[#c8dce0] bg-white/50 px-4 py-5 text-center"><p className="text-sm font-bold text-[#35465b]">No messages yet.</p><p className="mt-1 text-xs leading-5 text-[#5e7085]">Replies and guest-message translations are saved on this phone.</p></div>}
      </section>
    </main>
  );
}
