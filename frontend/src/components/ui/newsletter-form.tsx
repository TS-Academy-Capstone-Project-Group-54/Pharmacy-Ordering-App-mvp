"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSuccess(true);
    setEmail("");
  };

  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
      <input
        required
        type="email"
        placeholder="Enter your email for health updates"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
      />
      <Button type="submit">Subscribe</Button>
      {success ? <p className="text-sm text-emerald-600">Thanks! You are subscribed.</p> : null}
    </form>
  );
}
