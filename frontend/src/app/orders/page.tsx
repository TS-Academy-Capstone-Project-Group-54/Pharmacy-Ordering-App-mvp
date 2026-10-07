"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatNaira, safeDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading, authFetch } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(true);
        const res = await authFetch("/api/orders/my-orders");
        const payload = await res.json();
        if (active && payload.success && Array.isArray(payload.data)) {
          setRows(payload.data);
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

  if (authLoading || loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <LoadingSpinner label="Loading your order history..." />
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <EmptyState
          title="You have not placed any orders yet."
          subtitle="When you place an order from the medicine catalogue, it will appear here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Link
          href="/medicines"
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Order More Medicines
        </Link>
      </div>
      <div className="space-y-3">
        {rows.map((o) => (
          <article
            key={o.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm text-slate-500">Placed on {safeDate(o.createdAt)}</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  Delivery Address: {o.deliveryAddress}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={o.orderStatus} />
                <p className="font-bold text-emerald-700 dark:text-emerald-400">
                  {formatNaira(Number(o.totalAmount))}
                </p>
                <Link
                  className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                  href={`/orders/${o.id}`}
                >
                  View Details
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
