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

const emptyResults: SearchData = { medicines: [], categories: [], faqs: [], posts: [] };

export function SiteSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchData>(emptyResults);

  useEffect(() => {
    const query = q.trim();
    if (!query) {
      setResults(emptyResults);
      return;
    }
    const controller = new AbortController();
    const id = setTimeout(async () => {
      try {
        const res = await fetch(apiUrl(`/api/search?q=${encodeURIComponent(query)}`), { signal: controller.signal });
        const payload = await res.json();
        if (payload.success) setResults(payload.data);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") setResults(emptyResults);
      }
    }, 250);
    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [q]);

  const hasResults = results.medicines.length + results.categories.length + results.faqs.length + results.posts.length > 0;

  return (
    <div className="relative w-full min-w-0">
      <label htmlFor="site-search" className="sr-only">Search medicines and site content</label>
      <div className="flex w-full items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
        <input
          id="site-search"
          type="search"
          value={q}
          onFocus={() => setOpen(true)}
          onChange={(event) => { setQ(event.target.value); setOpen(true); }}
          onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
          placeholder="Search medicines, categories, FAQs..."
          autoComplete="off"
          className="min-w-0 w-full border-0 bg-transparent py-2.5 text-sm outline-none ring-0 placeholder:text-slate-400 focus:ring-0 dark:text-slate-100"
        />
        {q ? <button type="button" onClick={() => { setQ(""); setOpen(false); }} aria-label="Clear search" className="shrink-0 px-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">×</button> : null}
      </div>
      {open && q.trim() ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[70] max-h-[min(70vh,28rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          {results.medicines.map((medicine) => <Link key={medicine.id} href={`/medicines/${medicine.id}`} onClick={() => setOpen(false)} className="block rounded-lg p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">{medicine.name} <span className="text-xs text-slate-500">({medicine.genericName})</span></Link>)}
          {results.categories.map((category) => <Link key={category.id} href={`/medicines?category=${category.id}`} onClick={() => setOpen(false)} className="block rounded-lg p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Category: {category.name}</Link>)}
          {results.faqs.map((faq) => <Link key={faq.id} href={faq.href} onClick={() => setOpen(false)} className="block rounded-lg p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">FAQ: {faq.question}</Link>)}
          {results.posts.map((post) => <Link key={post.id} href={post.href} onClick={() => setOpen(false)} className="block rounded-lg p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">{post.title} <span className="text-xs text-slate-500">Last updated: {post.lastUpdated}</span></Link>)}
          {!hasResults ? <p className="p-2 text-sm text-slate-500">No results found.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
