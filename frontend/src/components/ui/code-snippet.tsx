"use client";

import { useState } from "react";

export function CodeSnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="rounded-xl bg-slate-950 p-4 text-slate-100">
      <pre className="overflow-x-auto text-xs">{code}</pre>
      <button
        onClick={handleCopy}
        className="mt-3 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold transition hover:bg-emerald-700"
      >
        {copied ? "Copied" : "Copy to clipboard"}
      </button>
    </div>
  );
}
