import Link from "next/link";

export function PlaceholderScreen({ title, description }: { title: string; description: string }) {
  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-6">
      <Link href="/" className="text-sm font-bold text-[#1f5d3b]">← Home</Link>
      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-3 text-base leading-6 text-slate-700">{description}</p>
        <p className="mt-8 rounded-lg bg-[#f4f7f1] p-4 text-sm font-medium text-slate-700">This section will be completed in its scheduled milestone.</p>
      </section>
    </main>
  );
}
