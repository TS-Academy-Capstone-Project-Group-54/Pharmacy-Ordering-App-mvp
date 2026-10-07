"use client";

import { useState } from "react";

export function FAQSection({
  items,
}: {
  items: Array<{ q: string; a: string }>;
}) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3" id="faq">
      {items.map((item, idx) => (
        <div key={item.q} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <button
            className="flex w-full items-center justify-between text-left font-semibold hover:text-emerald-600"
            onClick={() => setOpen(open === idx ? null : idx)}
            type="button"
          >
            {item.q} <span>{open === idx ? "−" : "+"}</span>
          </button>
          {open === idx ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.a}</p> : null}
        </div>
      ))}
    </div>
  );
}
