"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { formatNaira } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleQuantityChange = (medicineId: string, newQuantity: number, availableStock: number) => {
    setUpdateError(null);
    
    if (newQuantity < 1) {
      setUpdateError("Quantity must be at least 1");
      return;
    }
    
    if (newQuantity > availableStock) {
      setUpdateError(`Only ${availableStock} items available in stock`);
      return;
    }
    
    updateQuantity(medicineId, newQuantity);
  };

  if (!items.length) return <EmptyState title="Your cart is empty." subtitle="Add medicines and continue shopping." />;

  return (
    <div>
      <h1 className="text-3xl font-bold">Shopping Cart</h1>
      {updateError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {updateError}
        </div>
      )}
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
                <p className="text-xs text-slate-500 dark:text-slate-400">Stock available: {item.availableStock}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="rounded border px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={() => handleQuantityChange(item.medicineId, item.quantity - 1, item.availableStock)}
                disabled={item.quantity <= 1}
                title="Decrease quantity"
              >
                −
              </button>
              <div className="flex items-center justify-center w-12">
                <input 
                  type="number" 
                  min="1" 
                  max={item.availableStock} 
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.medicineId, parseInt(e.target.value) || 1, item.availableStock)}
                  className="w-full text-center rounded border px-1 py-1 dark:bg-slate-800 dark:border-slate-700"
                  aria-label="Quantity"
                />
              </div>
              <button 
                className="rounded border px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={() => handleQuantityChange(item.medicineId, item.quantity + 1, item.availableStock)}
                disabled={item.quantity >= item.availableStock}
                title="Increase quantity"
              >
                +
              </button>
              <button 
                className="rounded border border-red-300 px-2 py-1 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950" 
                onClick={() => removeItem(item.medicineId)}
                title="Remove from cart"
              >
                Remove
              </button>
            </div>
            <p className="font-semibold">{formatNaira(item.quantity * item.unitPrice)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-xl border bg-white p-4 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold">Total: {formatNaira(subtotal)}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{items.length} item{items.length !== 1 ? 's' : ''} in cart</p>
        </div>
        <Link href="/checkout" className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition-colors text-center">
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}