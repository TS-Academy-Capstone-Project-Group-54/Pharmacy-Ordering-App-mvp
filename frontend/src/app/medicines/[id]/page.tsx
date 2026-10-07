"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AddToCartWidget } from "./widget";
import { formatNaira, medicineImageFor, safeDate } from "@/lib/utils";
import { apiUrl } from "@/lib/api-url";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function MedicineDetailsPage() {
  const params = useParams<{ id: string }>();
  const [m, setM] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(apiUrl(`/api/medicines/${params.id}`));
        const payload = await res.json();
        if (payload.success) setM(payload.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) return <LoadingSpinner label="Loading medicine details..." />;
  if (!m) return <p>Medicine not found.</p>;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="relative h-[340px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <Image src={medicineImageFor(m.id, m.image)} alt={m.name} fill className="object-cover" />
      </div>
      <div>
        <h1 className="text-3xl font-bold">{m.name}</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">Generic: {m.genericName}</p>
        <p className="mt-4">{m.description}</p>
        <ul className="mt-4 space-y-1 text-sm">
          <li>Manufacturer: {m.manufacturer}</li>
          <li>Dosage: {m.dosage}</li>
          <li>Expiry: {safeDate(m.expiryDate)}</li>
          <li>Prescription: {m.requiresPrescription ? "Required" : "Not required"}</li>
          <li>Availability: {m.quantityInStock > 0 ? `In stock (${m.quantityInStock})` : "Out of stock"}</li>
        </ul>
        <p className="mt-4 text-2xl font-bold text-emerald-700 dark:text-emerald-400">{formatNaira(Number(m.price))}</p>
        <div className="mt-4">
          <AddToCartWidget medicine={m} />
        </div>
      </div>
    </div>
  );
}
