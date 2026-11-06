"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiUrl } from "@/lib/api-url";
import { Button } from "@/components/ui/button";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!token) {
      setError("This reset link is missing its token. Request a new link.");
      return;
    }
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) setError(payload.message || "This reset link could not be used.");
      else setMessage(payload.data?.message || "Password changed. You can now sign in.");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-2xl font-bold">Choose a new password</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Choose a password with at least 8 characters. Reset links expire after 30 minutes and can only be used once.</p>
      <form className="mt-5 space-y-4" onSubmit={submit}>
        <div>
          <label htmlFor="new-password" className="mb-1 block text-sm font-medium">New password</label>
          <input id="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        </div>
        <div>
          <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium">Confirm new password</label>
          <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        </div>
        {message ? <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{message} <Link href="/login" className="font-semibold underline">Sign in</Link></p> : null}
        {error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{error}</p> : null}
        <Button type="submit" disabled={loading || !!message} className="w-full">{loading ? "Updating password…" : "Change password"}</Button>
      </form>
      <p className="mt-4 text-sm"><Link href="/forgot-password" className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400">Request another reset link</Link></p>
    </section>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="mx-auto max-w-md p-6 text-sm text-slate-500">Loading password reset…</div>}><ResetPasswordForm /></Suspense>;
}
