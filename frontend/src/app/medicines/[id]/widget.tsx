"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { medicineImageFor } from "@/lib/utils";

export function AddToCartWidget({ medicine }: { medicine: any }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        min={1}
        max={medicine.quantityInStock}
        value={qty}
        onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
        className="w-20 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
      />
      <Button
        onClick={() =>
          addItem({
            medicineId: medicine.id,
            medicineName: medicine.name,
            quantity: qty,
            unitPrice: Number(medicine.price),
            image: medicineImageFor(medicine.id, medicine.image),
            availableStock: medicine.quantityInStock,
          })
        }
        disabled={medicine.quantityInStock < 1}
      >
        Add to cart
      </Button>
    </div>
  );
}
