"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { formatNaira } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading, authFetch } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"Pending" | "Paid" | "Failed">("Paid");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    setCustomerName(user.fullName);
    (async () => {
      try {
        const res = await authFetch("/api/users/profile");
        const payload = await res.json();
        if (payload.success && payload.data) {
          setCustomerName(payload.data.fullName || user.fullName);
          setPhoneNumber(payload.data.phoneNumber || "");
          setDeliveryAddress(payload.data.address || "");
        }
      } catch {
        // Ignore
      }
    })();
  }, [user, authFetch]);

  if (authLoading || !user) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <LoadingSpinner label="Preparing checkout..." />
      </div>
    );
  }

  const placeOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);
    setError("");

    try {
      const res = await authFetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryAddress,
          phoneNumber,
          paymentStatus,
          items: items.map((i) => ({ medicineId: i.medicineId, quantity: i.quantity })),
        }),
      });

      const payload = await res.json();
      setLoading(false);

      if (!payload.success || !payload.data) {
        setError(payload.message || "Order could not be placed.");
        return;
      }

      const id = payload.data.id;
      clearCart();
      router.push(`/orders/${id}`);
    } catch {
      setLoading(false);
      setError("Order could not be placed. Please try again.");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 fade-in">
      <section>
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Confirm your Nigerian delivery address and place your medicine order.
        </p>
        <form onSubmit={placeOrder} className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Customer Name</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              placeholder="Customer full name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Phone Number</label>
            <input
              name="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              placeholder="+234 803 000 0000"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Delivery Address</label>
            <textarea
              name="deliveryAddress"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              required
              placeholder="Street, area, city, state"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
              MVP Payment Simulation Status
            </label>
            <select
              name="paymentStatus"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as "Pending" | "Paid" | "Failed")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="Paid">Paid (Instant Transfer / Card MVP)</option>
              <option value="Pending">Pending (Pay on Delivery)</option>
              <option value="Failed">Failed (Test Payment Failure)</option>
            </select>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={loading || !items.length} className="w-full">
            {loading ? "Placing order..." : `Place Order (${formatNaira(subtotal)})`}
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">Order Summary</h2>
        {items.length === 0 ? (
          <div className="mt-4 text-sm text-slate-500">
            Your cart is empty.{" "}
            <Link href="/medicines" className="text-emerald-700 underline">
              Browse medicines
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-3 divide-y divide-slate-200 text-sm dark:divide-slate-800">
              {items.map((i) => (
                <div className="flex items-center justify-between py-2.5" key={i.medicineId}>
                  <div>
                    <p className="font-medium">{i.medicineName}</p>
                    <p className="text-xs text-slate-500">
                      Qty: {i.quantity} × {formatNaira(i.unitPrice)}
                    </p>
                  </div>
                  <span className="font-semibold">{formatNaira(i.unitPrice * i.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-emerald-700 dark:text-emerald-400">{formatNaira(subtotal)}</span>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
