"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNaira, safeDate } from "@/lib/utils";

export default function DashboardPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const { items: cartItems } = useCart();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    // Keep dashboard stable after login in cross-origin previews.
    // If auth data is delayed/unavailable, we show a fallback panel instead of force-redirect bounce.
  }, [authLoading, user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        setLoadingOrders(true);
        const res = await authFetch("/api/orders/my-orders");
        const payload = await res.json();
        if (active && payload.success && Array.isArray(payload.data)) {
          setOrders(payload.data);
        }
      } catch {
        // Ignore
      } finally {
        if (active) setLoadingOrders(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, authFetch]);

  if (authLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <LoadingSpinner label="Loading your Customer Dashboard..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-900 dark:bg-amber-950/40">
        <h1 className="text-2xl font-bold text-amber-800 dark:text-amber-300">Session not ready yet</h1>
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
          We could not verify your dashboard session in this browser context. Please login again.
        </p>
        <Link href="/login" className="mt-4 inline-block rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
          Go to Login
        </Link>
      </div>
    );
  }

  const pendingOrActive = orders.filter(
    (o) => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled",
  ).length;
  const deliveredCount = orders.filter((o) => o.orderStatus === "Delivered").length;
  const totalSpent = orders
    .filter((o) => o.orderStatus !== "Cancelled")
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  return (
    <div className="space-y-8 fade-in">
      <section className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white shadow-lg md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              {user.role === "admin" ? "Pharmacy Administrator" : "Customer Dashboard"}
            </span>
            <h1 className="mt-2 text-3xl font-bold">Welcome back, {user.fullName}!</h1>
            <p className="mt-1 text-sm text-emerald-50">
              Manage your medicine orders, track deliveries across Nigeria, and update your profile.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/medicines"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50"
            >
              Browse Medicines
            </Link>
            <Link
              href="/cart"
              className="rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
            >
              Cart ({cartItems.length})
            </Link>
            <Link
              href="/orders"
              className="rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
            >
              My Orders
            </Link>
            <Link
              href="/profile"
              className="rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
            >
              Profile
            </Link>
            {user.role === "admin" ? (
              <Link
                href="/admin"
                className="rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-300"
              >
                Open Admin Portal
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Orders</p>
          <p className="mt-2 text-3xl font-bold">{orders.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Active / In Fulfilment</p>
          <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">{pendingOrActive}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Delivered Orders</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{deliveredCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Ordered (₦)</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-400">{formatNaira(totalSpent)}</p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent Orders & Fulfilment Status</h2>
          <Link href="/orders" className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
            View all orders →
          </Link>
        </div>

        {loadingOrders ? (
          <LoadingSpinner label="Loading your recent orders..." />
        ) : orders.length === 0 ? (
          <EmptyState
            title="You have not placed any orders yet."
            subtitle="Browse our NAFDAC-verified medicine catalogue and place your first order in Naira (₦)."
          />
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((o) => (
              <article
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <p className="font-bold">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-slate-500">Placed on {safeDate(o.createdAt)}</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    Delivery: {o.deliveryAddress}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={o.orderStatus} />
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {formatNaira(Number(o.totalAmount))}
                  </span>
                  <Link
                    href={`/orders/${o.id}`}
                    className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Track & Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
