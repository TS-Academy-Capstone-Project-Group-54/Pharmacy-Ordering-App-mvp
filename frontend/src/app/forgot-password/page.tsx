"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { apiUrl } from "@/lib/api-url";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(apiUrl("/api/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        setError(payload.message || "Unable to request a reset link right now.");
      } else {
        setMessage(payload.data?.message || "If an account exists for that email, a reset link will be sent shortly.");
      }
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-2xl font-bold">Forgot your password?</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Enter your account email and we’ll send you a secure, time-limited password reset link.</p>
      <form className="mt-5 space-y-4" onSubmit={submit}>
        <div>
          <label htmlFor="reset-email" className="mb-1 block text-sm font-medium">Email address</label>
          <input id="reset-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="you@example.com" />
        </div>
        {message ? <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{message}</p> : null}
        {error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{error}</p> : null}
        <Button type="submit" disabled={loading} className="w-full">{loading ? "Sending…" : "Send reset link"}</Button>
      </form>
      <p className="mt-4 text-sm"><Link href="/login" className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400">Back to login</Link></p>
    </section>
  );
}
