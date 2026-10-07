"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export function HomeHeroActions() {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="mt-5 flex gap-2.5">
        <Link href="/medicines" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white transition hover:bg-emerald-700">
          Browse Medicines
        </Link>
        <Link href="/dashboard" className="rounded-xl border border-slate-300 px-4 py-2 text-sm transition hover:bg-white/70 dark:border-slate-700">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-5 flex flex-wrap gap-2.5">
      <Link href="/medicines" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white transition hover:bg-emerald-700">
        Browse Medicines
      </Link>
      <Link href="/register" className="rounded-xl border border-slate-300 px-4 py-2 text-sm transition hover:bg-white/70 dark:border-slate-700">
        Create Account
      </Link>
      <Link href="/login" className="rounded-xl border border-emerald-600 px-4 py-2 text-sm text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-slate-800">
        Login
      </Link>
    </div>
  );
}
