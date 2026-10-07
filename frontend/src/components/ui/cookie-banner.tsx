"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("group54-cookies");
    if (!accepted) setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-4xl rounded-2xl bg-slate-900 p-4 text-white shadow-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm">We use cookies to improve your experience on this Nigerian pharmacy platform.</p>
        <Button
          onClick={() => {
            localStorage.setItem("group54-cookies", "accepted");
            setOpen(false);
          }}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          Accept
        </Button>
      </div>
    </div>
  );
}
