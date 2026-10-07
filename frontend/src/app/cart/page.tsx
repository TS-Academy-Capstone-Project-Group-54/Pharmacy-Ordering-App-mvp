"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { formatNaira } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (!items.length) return <EmptyState title="Your cart is empty." subtitle="Add medicines and continue shopping." />;

  return (
    <div>
      <h1 className="text-3xl font-bold">Shopping Cart</h1>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.medicineId} className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-lg">
                <Image src={item.image} alt={item.medicineName} fill className="object-cover" />
              </div>
              <div>
                <p className="font-semibold">{item.medicineName}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{formatNaira(item.unitPrice)} each</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded border px-2 py-1 hover:bg-slate-100" onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button className="rounded border px-2 py-1 hover:bg-slate-100" onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}>+</button>
              <button className="rounded border border-red-300 px-2 py-1 text-red-600 hover:bg-red-50" onClick={() => removeItem(item.medicineId)}>Remove</button>
            </div>
            <p className="font-semibold">{formatNaira(item.quantity * item.unitPrice)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border bg-white p-4 dark:bg-slate-900">
        <p className="text-lg font-semibold">Total: {formatNaira(subtotal)}</p>
        <Link href="/checkout" className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Proceed to checkout</Link>
      </div>
    </div>
  );
}
