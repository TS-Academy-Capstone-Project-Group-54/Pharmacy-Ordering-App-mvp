"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatNaira, safeDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

const WORKFLOW_STEPS = [
  "Pending",
  "Confirmed",
  "Processing",
  "Ready for Delivery",
  "Out for Delivery",
  "Delivered",
];

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading, authFetch } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !params.id) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await authFetch(`/api/orders/${params.id}`);
        const payload = await res.json();
        if (!active) return;
        if (payload.success && payload.data) {
          setOrder(payload.data);
        } else {
          setError(payload.message || "Order not found");
        }
      } catch {
        if (active) setError("Unable to load order details.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, params.id, authFetch]);

  if (authLoading || loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <LoadingSpinner label="Loading order confirmation & tracking..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/40">
        <h1 className="text-xl font-bold text-red-700 dark:text-red-300">{error || "Order not found"}</h1>
        <Link href="/orders" className="mt-4 inline-block rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const currentStepIdx = WORKFLOW_STEPS.indexOf(order.orderStatus);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Order Confirmation & Tracking
          </p>
          <h1 className="text-3xl font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
        </div>
        <Link
          href="/orders"
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          ← Back to My Orders
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <p className="text-sm text-slate-500">Placed on {safeDate(order.createdAt)}</p>
            <p className="mt-1 text-sm">
              <span className="font-semibold">Payment Status:</span> {order.paymentStatus}
            </p>
          </div>
          <StatusBadge status={order.orderStatus} />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Delivery Information</h2>
            <p className="mt-1 font-medium">{order.deliveryAddress}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Phone: {order.phoneNumber}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Order Total (₦)</h2>
            <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {formatNaira(Number(order.totalAmount))}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold">Order Items</h2>
          <div className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {(order.items ?? []).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 text-sm">
                <div>
                  <p className="font-medium">{item.medicineName}</p>
                  <p className="text-xs text-slate-500">
                    {formatNaira(Number(item.unitPrice))} × {item.quantity}
                  </p>
                </div>
                <span className="font-semibold">{formatNaira(Number(item.subtotal))}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold">Fulfilment Status Timeline</h2>
          {order.orderStatus === "Cancelled" ? (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
              This order was cancelled and reserved medicine stock has been restored.
            </div>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-3 md:grid-cols-6">
              {WORKFLOW_STEPS.map((step, idx) => {
                const completed = currentStepIdx >= idx;
                return (
                  <div
                    key={step}
                    className={`rounded-xl border p-3 text-center text-xs font-medium ${
                      completed
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/40"
                    }`}
                  >
                    <div className="font-bold">{idx + 1}</div>
                    <div className="mt-1">{step}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
