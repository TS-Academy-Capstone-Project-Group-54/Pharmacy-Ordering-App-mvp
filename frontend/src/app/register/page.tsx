"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api-url";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuthSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState<{ open: boolean; fullName: string } | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          email: form.get("email"),
          password: form.get("password"),
          phoneNumber: form.get("phoneNumber"),
          address: form.get("address"),
        }),
      });

      const payload = await res.json();
      setLoading(false);

      if (!payload.success || !payload.data) {
        setError(payload.message || "Unable to create your account.");
        return;
      }

      setAuthSession(payload.data);
      setSuccessModal({
        open: true,
        fullName: payload.data.fullName,
      });

      setTimeout(() => {
        router.replace("/dashboard");
      }, 1100);
    } catch {
      setLoading(false);
      setError("Unable to connect to the server. Please try again.");
    }
  };

  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-2xl font-bold">Create Customer Account</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Register with NaijaCare Pharmacy to order genuine medicines across Nigeria.
      </p>

      <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Full Name</label>
          <input
            name="fullName"
            required
            placeholder="e.g., Chinedu Okafor"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Email Address</label>
          <input
            name="email"
            required
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Password (minimum 6 characters)
          </label>
          <div className="relative">
            <input
              name="password"
              required
              minLength={6}
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-20 dark:border-slate-700 dark:bg-slate-800"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-2 rounded px-2 py-1 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Nigerian Phone Number
          </label>
          <input
            name="phoneNumber"
            required
            placeholder="e.g., +234 803 123 4567"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Delivery Address</label>
          <textarea
            name="address"
            required
            placeholder="Street address, area, city, state (e.g., 14 Admiralty Way, Lekki Phase 1, Lagos)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <Button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </Button>
      </form>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
          Login
        </Link>
      </p>

      {successModal?.open ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/50 p-4 backdrop-blur-xs fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-2xl dark:border-emerald-800 dark:bg-slate-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300">
              ✓
            </div>
            <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">Registration Successful!</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Welcome to NaijaCare, <span className="font-semibold">{successModal.fullName}</span>! Taking you to your
              Customer Dashboard...
            </p>
            <Button type="button" onClick={() => router.replace("/dashboard")} className="mt-5 w-full">
              Go to Customer Dashboard Now
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
