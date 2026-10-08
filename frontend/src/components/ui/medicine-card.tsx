"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { formatNaira, medicineImageFor } from "@/lib/utils";

export function MedicineCard({ medicine }: { medicine: any }) {
  const { addItem } = useCart();
  const stockCount = Number(medicine.quantityInStock ?? 0);
  const isOutOfStock = stockCount < 1;
  const isLowStock = stockCount > 0 && stockCount <= 5;

  const stockLabel = isOutOfStock ? "Out of stock" : isLowStock ? "Low stock" : "In stock";
  const stockClass = isOutOfStock
    ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
    : isLowStock
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="relative h-40 overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={medicineImageFor(medicine.id, medicine.image)}
          alt={medicine.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className={`absolute left-3 top-3 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${stockClass}`}>
          {stockLabel}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
            {medicine.categoryName || "Medicine"}
          </p>
          <h3 className="mt-1 line-clamp-2 text-base font-semibold text-slate-900 dark:text-white">
            {medicine.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{medicine.genericName}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{formatNaira(Number(medicine.price))}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Stock: {stockCount}</p>
          </div>
          <div className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {medicine.dosage || "Standard"}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Link
            href={`/medicines/${medicine.id}`}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            View
          </Link>

          <Button
            className="flex-1 text-sm"
            disabled={isOutOfStock}
            onClick={() =>
              addItem({
                medicineId: medicine.id,
                medicineName: medicine.name,
                unitPrice: Number(medicine.price),
                quantity: 1,
                image: medicineImageFor(medicine.id, medicine.image),
                availableStock: stockCount,
              })
            }
          >
            {isOutOfStock ? "Sold Out" : "Add"}
          </Button>
        </div>
      </div>
    </article>
  );
}
