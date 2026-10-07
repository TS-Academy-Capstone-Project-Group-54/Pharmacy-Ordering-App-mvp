"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (user.role !== "admin") router.replace("/dashboard");
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <LoadingSpinner label="Verifying administrator access..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap gap-2">
          <Link href="/admin" className="rounded-lg px-3 py-1.5 font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
            Admin Dashboard
          </Link>
          <Link href="/admin/medicines" className="rounded-lg px-3 py-1.5 font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
            Manage Medicines
          </Link>
          <Link href="/admin/categories" className="rounded-lg px-3 py-1.5 font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
            Manage Categories
          </Link>
          <Link href="/admin/orders" className="rounded-lg px-3 py-1.5 font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
            Manage Orders
          </Link>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          Admin: {user.fullName}
        </span>
      </nav>
      {children}
    </div>
  );
}
