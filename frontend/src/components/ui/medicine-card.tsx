"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { formatNaira, medicineImageFor } from "@/lib/utils";

export function MedicineCard({ medicine }: { medicine: any }) {
  const { addItem } = useCart();

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="relative h-40 overflow-hidden rounded-xl bg-slate-100">
        <Image src={medicineImageFor(medicine.id, medicine.image)} alt={medicine.name} fill className="object-cover" />
      </div>
      <h3 className="mt-3 text-base font-semibold">{medicine.name}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300">{medicine.genericName}</p>
      <p className="mt-2 font-semibold text-emerald-700 dark:text-emerald-400">{formatNaira(Number(medicine.price))}</p>
      <p className="mt-1 text-xs text-slate-500">Stock: {medicine.quantityInStock}</p>

      <div className="mt-3 flex gap-2">
        <Link href={`/medicines/${medicine.id}`} className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
          View
        </Link>
        <Button
          className="text-sm"
          disabled={medicine.quantityInStock < 1}
          onClick={() =>
            addItem({
              medicineId: medicine.id,
              medicineName: medicine.name,
              unitPrice: Number(medicine.price),
              quantity: 1,
              image: medicineImageFor(medicine.id, medicine.image),
              availableStock: medicine.quantityInStock,
            })
          }
        >
          Add to Cart
        </Button>
      </div>
    </article>
  );
}
