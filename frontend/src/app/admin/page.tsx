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
    {
      label: "Total Medicines",
      value: stats.totalMedicines,
      icon: "💊",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      borderColor: "border-blue-200 dark:border-blue-800",
      textColor: "text-blue-600 dark:text-blue-300",
      badgeBg: "bg-blue-100 dark:bg-blue-900",
    },
    {
      label: "Total Customers",
      value: stats.totalCustomers,
      icon: "👥",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      borderColor: "border-purple-200 dark:border-purple-800",
      textColor: "text-purple-600 dark:text-purple-300",
      badgeBg: "bg-purple-100 dark:bg-purple-900",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: "📦",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      textColor: "text-emerald-600 dark:text-emerald-300",
      badgeBg: "bg-emerald-100 dark:bg-emerald-900",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      icon: "⏳",
      bgColor: "bg-amber-50 dark:bg-amber-950",
      borderColor: "border-amber-200 dark:border-amber-800",
      textColor: "text-amber-600 dark:text-amber-300",
      badgeBg: "bg-amber-100 dark:bg-amber-900",
    },
    {
      label: "Processing Orders",
      value: stats.processingOrders,
      icon: "⚙️",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      borderColor: "border-orange-200 dark:border-orange-800",
      textColor: "text-orange-600 dark:text-orange-300",
      badgeBg: "bg-orange-100 dark:bg-orange-900",
    },
    {
      label: "Completed Orders",
      value: stats.completedOrders,
      icon: "✅",
      bgColor: "bg-green-50 dark:bg-green-950",
      borderColor: "border-green-200 dark:border-green-800",
      textColor: "text-green-600 dark:text-green-300",
      badgeBg: "bg-green-100 dark:bg-green-900",
    },
  ];

  return (
    <div className="space-y-8 fade-in">
      <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Pharmacy Admin Dashboard</h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
          Monitor Nigerian inventory, categories, and customer order fulfilment.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading pharmacy statistics..." />
      ) : (
        <>
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Overview</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className={`transform transition-all duration-300 hover:scale-105 rounded-2xl border ${card.borderColor} ${card.bgColor} p-6 shadow-sm hover:shadow-md dark:shadow-none`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${card.textColor}`}>{card.label}</p>
                      <p className="mt-3 text-4xl font-bold text-slate-900 dark:text-white">{String(card.value)}</p>
                    </div>
                    <div className={`rounded-lg ${card.badgeBg} p-3 text-2xl`}>{card.icon}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 dark:border-slate-800">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href="/admin/medicines"
                className="group flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg active:scale-95 dark:shadow-none"
              >
                <span>💊</span>
                <span>Manage Medicines & Stock</span>
              </Link>
              <Link
                href="/admin/categories"
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 px-6 py-3.5 text-base font-semibold text-slate-700 transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span>📂</span>
                <span>Manage Categories</span>
              </Link>
              <Link
                href="/admin/orders"
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 px-6 py-3.5 text-base font-semibold text-slate-700 transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span>📦</span>
                <span>Manage Customer Orders</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
