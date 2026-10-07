"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api-url";

type SearchData = {
  medicines: Array<{ id: string; name: string; genericName: string }>;
  categories: Array<{ id: string; name: string }>;
  faqs: Array<{ id: string; question: string; href: string }>;
  posts: Array<{ id: string; title: string; href: string; lastUpdated: string }>;
};

export function SiteSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchData>({ medicines: [], categories: [], faqs: [], posts: [] });

  useEffect(() => {
    const id = setTimeout(async () => {
      if (!q.trim()) {
        setResults({ medicines: [], categories: [], faqs: [], posts: [] });
        return;
      }
      const res = await fetch(apiUrl(`/api/search?q=${encodeURIComponent(q)}`));
      const payload = await res.json();
      if (payload.success) setResults(payload.data);
    }, 300);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        Search site
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[min(95vw,32rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search medicines, categories, FAQs..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <div className="mt-3 max-h-72 space-y-2 overflow-auto text-sm">
            {results.medicines.map((m) => (
              <Link key={m.id} href={`/medicines/${m.id}`} className="block rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                {m.name} <span className="text-xs text-slate-500">({m.genericName})</span>
              </Link>
            ))}
            {results.categories.map((c) => (
              <Link key={c.id} href={`/medicines?category=${c.id}`} className="block rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                Category: {c.name}
              </Link>
            ))}
            {results.faqs.map((f) => (
              <Link key={f.id} href={f.href} className="block rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                FAQ: {f.question}
              </Link>
            ))}
            {results.posts.map((p) => (
              <Link key={p.id} href={p.href} className="block rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                {p.title} <span className="text-xs text-slate-500">Last updated: {p.lastUpdated}</span>
              </Link>
            ))}
            {!results.medicines.length && !results.categories.length && !results.faqs.length && !results.posts.length ? (
              <p className="p-2 text-slate-500">No results yet.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
