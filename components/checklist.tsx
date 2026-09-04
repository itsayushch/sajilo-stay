"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getChecklistStates, saveChecklistState } from "@/lib/db";

const checklistItems = [
  { id: "clean-room", title: "Clean guest room", detail: "Fresh bedding, swept floor, and a clean bathroom." },
  { id: "safe-home", title: "Safety basics", detail: "First-aid kit, torch, secure locks, and clear exits." },
  { id: "guest-sheet", title: "Guest information sheet", detail: "House rules, meal times, and local guidance." },
  { id: "emergency-contacts", title: "Emergency contacts", detail: "Keep a doctor, police, taxi, and family number handy." },
  { id: "connectivity", title: "Connectivity information", detail: "Share the mobile-network spots and Wi-Fi details, if available." },
];

export function Checklist() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState("Loading checklist…");

  useEffect(() => {
    getChecklistStates()
      .then((states) => {
        setCheckedItems(Object.fromEntries(states.map((state) => [state.itemId, state.checked])));
        setNotice("");
      })
      .catch(() => setNotice("Could not open your saved checklist. Please try again."));
  }, []);

  const completed = useMemo(() => checklistItems.filter((item) => checkedItems[item.id]).length, [checkedItems]);

  async function toggleItem(itemId: string) {
    const previous = Boolean(checkedItems[itemId]);
    const next = !previous;
    setCheckedItems((current) => ({ ...current, [itemId]: next }));
    setNotice("Saved offline.");
    try {
      await saveChecklistState({ itemId, checked: next });
    } catch {
      setCheckedItems((current) => ({ ...current, [itemId]: previous }));
      setNotice("Could not save that change. Please try again.");
    }
  }

  return (
    <main className="site-shell mx-auto min-h-screen max-w-lg px-4 py-6">
      <Link href="/" className="home-link inline-flex min-h-11 items-center text-sm font-bold">← Back</Link>
      <header className="mt-6"><p className="text-sm font-bold text-[#1f5d3b]">Before guests arrive</p><h1 className="mt-1 text-3xl font-bold">Hosting checklist</h1><p className="muted-copy mt-2 text-base leading-6">A simple guide for a safe, welcoming stay.</p></header>
      <section aria-label="Checklist progress" className="paper-panel mt-6 p-4"><p className="sign-title text-xl font-bold">{completed} of {checklistItems.length} ready</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#d7e6da]"><div className="h-full rounded-full bg-[#1f5d3b] transition-all" style={{ width: `${(completed / checklistItems.length) * 100}%` }} /></div></section>
      <ul className="mt-6 grid gap-3">{checklistItems.map((item) => { const checked = Boolean(checkedItems[item.id]); return <li key={item.id} className={checked ? "border-l-4 border-[#1f5d3b] bg-white p-4" : "border-l-4 border-[#b9ccc0] bg-white p-4"}><label className="flex cursor-pointer items-start gap-4"><input type="checkbox" checked={checked} onChange={() => toggleItem(item.id)} className="mt-1 h-6 w-6 accent-[#1f5d3b]" /><span><span className="sign-title block text-xl font-bold">{item.title}</span><span className="muted-copy mt-1 block text-sm leading-5">{item.detail}</span></span></label></li>; })}</ul>
      <p className="status-line mt-5 text-sm font-bold" role="status">{notice}</p>
    </main>
  );
}
