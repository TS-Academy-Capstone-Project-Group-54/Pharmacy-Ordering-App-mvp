"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { formatNaira } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type ValidationErrors = {
  customerName?: string;
  phoneNumber?: string;
  deliveryAddress?: string;
};

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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isValidating, setIsValidating] = useState(false);

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

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validate customer name
    if (!customerName.trim()) {
      errors.customerName = "Customer name is required";
    } else if (customerName.trim().length < 2) {
      errors.customerName = "Customer name must be at least 2 characters";
    } else if (customerName.trim().length > 100) {
      errors.customerName = "Customer name must not exceed 100 characters";
    }

    // Validate phone number - Nigerian format
    if (!phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else {
      const phoneRegex = /^(\+234|0)[0-9]{10}$/; // Nigerian format: +2340000000000 or 00000000000
      if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
        errors.phoneNumber = "Please enter a valid Nigerian phone number (e.g., +234 803 000 0000 or 08030000000)";
      }
    }

    // Validate delivery address
    if (!deliveryAddress.trim()) {
      errors.deliveryAddress = "Delivery address is required";
    } else if (deliveryAddress.trim().length < 5) {
      errors.deliveryAddress = "Delivery address must be at least 5 characters";
    } else if (deliveryAddress.trim().length > 200) {
      errors.deliveryAddress = "Delivery address must not exceed 200 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  if (authLoading || !user) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <LoadingSpinner label="Preparing checkout..." />
      </div>
    );
  }

  const placeOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setError("");
    setIsValidating(true);

    if (!validateForm()) {
      setIsValidating(false);
      return;
    }

    if (!items.length) {
      setError("Your cart is empty");
      setIsValidating(false);
      return;
    }

    setLoading(true);

    try {
      const res = await authFetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryAddress: deliveryAddress.trim(),
          phoneNumber: phoneNumber.trim(),
          paymentStatus,
          items: items.map((i) => ({ medicineId: i.medicineId, quantity: i.quantity })),
        }),
      });

      const payload = await res.json();
      setLoading(false);
      setIsValidating(false);

      if (!payload.success || !payload.data) {
        setError(payload.message || "Order could not be placed. Please try again.");
        return;
      }

      const id = payload.data.id;
      clearCart();
      router.push(`/orders/${id}`);
    } catch (err) {
      setLoading(false);
      setIsValidating(false);
      setError("Order could not be placed. Please check your connection and try again.");
      console.error("Order placement error:", err);
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
          {/* Error Message Alert */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200 flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Customer Name Field */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Customer Name {validationErrors.customerName && <span className="text-red-600">*</span>}
            </label>
            <input
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (validationErrors.customerName) {
                  setValidationErrors((prev) => ({ ...prev, customerName: undefined }));
                }
              }}
              placeholder="Customer full name"
              className={`w-full rounded-lg border px-3 py-2 dark:bg-slate-800 ${
                validationErrors.customerName
                  ? "border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-950/20"
                  : "border-slate-300 dark:border-slate-700"
              }`}
            />
            {validationErrors.customerName && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <span>✕</span> {validationErrors.customerName}
              </p>
            )}
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Phone Number {validationErrors.phoneNumber && <span className="text-red-600">*</span>}
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (validationErrors.phoneNumber) {
                  setValidationErrors((prev) => ({ ...prev, phoneNumber: undefined }));
                }
              }}
              placeholder="+234 803 000 0000"
              className={`w-full rounded-lg border px-3 py-2 dark:bg-slate-800 ${
                validationErrors.phoneNumber
                  ? "border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-950/20"
                  : "border-slate-300 dark:border-slate-700"
              }`}
            />
            {validationErrors.phoneNumber && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <span>✕</span> {validationErrors.phoneNumber}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Format: +234 XXX XXX XXXX or 0XXX XXX XXXX</p>
          </div>

          {/* Delivery Address Field */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Delivery Address {validationErrors.deliveryAddress && <span className="text-red-600">*</span>}
            </label>
            <textarea
              name="deliveryAddress"
              value={deliveryAddress}
              onChange={(e) => {
                setDeliveryAddress(e.target.value);
                if (validationErrors.deliveryAddress) {
                  setValidationErrors((prev) => ({ ...prev, deliveryAddress: undefined }));
                }
              }}
              placeholder="Street, area, city, state"
              rows={3}
              className={`w-full rounded-lg border px-3 py-2 dark:bg-slate-800 ${
                validationErrors.deliveryAddress
                  ? "border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-950/20"
                  : "border-slate-300 dark:border-slate-700"
              }`}
            />
            {validationErrors.deliveryAddress && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <span>✕</span> {validationErrors.deliveryAddress}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{deliveryAddress.length}/200 characters</p>
          </div>

          {/* Payment Status Field */}
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
              <option value="Paid">✓ Paid (Instant Transfer / Card MVP)</option>
              <option value="Pending">⏱ Pending (Pay on Delivery)</option>
              <option value="Failed">✗ Failed (Test Payment Failure)</option>
            </select>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={loading || isValidating || !items.length} 
            className="w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin">⟳</span>
                Placing order...
              </span>
            ) : (
              `Place Order (${formatNaira(subtotal)})`
            )}
          </Button>
        </form>
      </section>

      {/* Order Summary Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">Order Summary</h2>
        {items.length === 0 ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-center dark:border-amber-900 dark:bg-amber-950">
            <p className="text-sm text-amber-700 dark:text-amber-200">
              Your cart is empty.{" "}
              <Link href="/medicines" className="font-semibold underline hover:no-underline">
                Browse medicines
              </Link>
            </p>
          </div>
        ) : (
          <>
            <div className="mt-3 divide-y divide-slate-200 text-sm dark:divide-slate-800">
              {items.map((i) => (
                <div className="flex items-center justify-between py-2.5" key={i.medicineId}>
                  <div>
                    <p className="font-medium">{i.medicineName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
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
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {items.length} item{items.length !== 1 ? 's' : ''} • Order will be delivered to your address
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}