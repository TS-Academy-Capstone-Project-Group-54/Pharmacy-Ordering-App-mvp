"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, authFetch, setAuthSession, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ fullName: "", phoneNumber: "", address: "", email: "" });

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const res = await authFetch("/api/users/profile");
        const payload = await res.json();
        if (active && payload.success && payload.data) {
          setForm(payload.data);
        }
      } catch {
        // Ignore
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, authFetch]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await authFetch("/api/users/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: form.fullName, phoneNumber: form.phoneNumber, address: form.address }),
    });
    const payload = await res.json();
    setSaving(false);
    setMessage(payload.message);
    if (payload.success && payload.data && user) {
      setAuthSession({
        userId: user.userId,
        email: user.email,
        role: user.role,
        fullName: payload.data.fullName,
        token: token ?? undefined,
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <LoadingSpinner label="Loading your profile..." />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-2xl font-bold">Customer Profile</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Update your personal details and default Nigerian delivery address.
      </p>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Full Name</label>
          <input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Email Address</label>
          <input
            value={form.email}
            disabled
            className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Phone Number</label>
          <input
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Delivery Address</label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Update Profile"}
        </Button>
      </form>
      {message ? (
        <p className="mt-3 rounded-lg bg-emerald-50 p-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
          {message}
        </p>
      ) : null}
    </section>
  );
}
