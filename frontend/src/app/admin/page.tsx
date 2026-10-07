"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminDashboardPage() {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await authFetch("/api/admin/stats");
        const payload = await res.json();
        if (active && payload.success && payload.data) {
          setStats(payload.data);
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
  }, [authFetch]);

  const cards = [
    ["Total Medicines", stats.totalMedicines],
    ["Total Customers", stats.totalCustomers],
    ["Pending Orders", stats.pendingOrders],
    ["Processing Orders", stats.processingOrders],
    ["Completed Orders", stats.completedOrders],
    ["Total Orders", stats.totalOrders],
  ];

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold">Pharmacy Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Monitor Nigerian inventory, categories, and customer order fulfilment.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading pharmacy statistics..." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-bold">{String(value)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/medicines" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
          Manage Medicines & Stock
        </Link>
        <Link href="/admin/categories" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
          Manage Categories
        </Link>
        <Link href="/admin/orders" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
          Manage Customer Orders
        </Link>
      </div>
    </div>
  );
}
