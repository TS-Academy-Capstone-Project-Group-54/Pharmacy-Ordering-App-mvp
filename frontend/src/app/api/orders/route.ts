import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { formatNaira } from "@/lib/utils";

export default function AdminMedicinesPage() {
  const { authFetch } = useAuth();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { price: string; quantityInStock: string }>>({});
  const [feedback, setFeedback] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [medRes, catRes] = await Promise.all([
      authFetch("/api/medicines?limit=100&includeInactive=true"),
      authFetch("/api/categories"),
    ]);
    const medPayload = await medRes.json();
    const catPayload = await catRes.json();
    const meds = medPayload.data?.items || [];
    setMedicines(meds);
    setCategories(catPayload.data || []);
    setDrafts(
      Object.fromEntries(
        meds.map((m: any) => [m.id, { price: String(Number(m.price)), quantityInStock: String(m.quantityInStock) }]),
      ),
    );
    setLoading(false);
  }, [authFetch]);

  useEffect(() => {
    void load();
  }, [load]);

  const createMedicine = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback("");
    const form = new FormData(e.currentTarget);

    const res = await authFetch("/api/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        genericName: form.get("genericName"),
        description: form.get("description"),
        categoryId: form.get("categoryId") || null,
        price: Number(form.get("price")),
        quantityInStock: Number(form.get("quantityInStock")),
        dosage: form.get("dosage"),
        manufacturer: form.get("manufacturer"),
        image: form.get("image") || "/images/pharmacy-hero.png",
        expiryDate: form.get("expiryDate"),
        requiresPrescription: form.get("requiresPrescription") === "on",
        isAvailable: true,
      }),
    });
    const payload = await res.json();
    setFeedback(payload.message);

    if (payload.success) {
      e.currentTarget.reset();
      await load();
    }
  };

  const updateMedicine = async (id: string) => {
    const med = medicines.find((m) => m.id === id);
    const draft = drafts[id];
    if (!med || !draft) return;

    const res = await authFetch(`/api/medicines/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...med,
        image: (med.image ?? "/images/pharmacy-hero.png").trim() || "/images/pharmacy-hero.png",
        price: Number(draft.price),
        quantityInStock: Number(draft.quantityInStock),
      }),
    });
    const payload = await res.json();
    setFeedback(payload.message);
    await load();
  };

  const deactivate = async () => {
    if (!removeId) return;
    await authFetch(`/api/medicines/${removeId}`, { method: "DELETE" });
    setRemoveId(null);
    await load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Medicines</h1>

      {feedback ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
          {feedback}
        </div>
      ) : null}

      <form className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-3 dark:bg-slate-900" onSubmit={createMedicine}>
        <input name="name" required placeholder="Medicine name" className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <input name="genericName" required placeholder="Generic name" className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <input name="price" required type="number" min="1" step="0.01" placeholder="Price" className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <input name="quantityInStock" required type="number" min="0" placeholder="Stock" className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <select name="categoryId" className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input name="dosage" required placeholder="Dosage" className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <input name="manufacturer" required placeholder="Manufacturer" className="rounded-lg border px-3 py-2 md:col-span-2 dark:border-slate-700 dark:bg-slate-800" />
        <input name="image" placeholder="Image URL" className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <input name="expiryDate" required type="date" className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <label className="flex items-center gap-2 rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
          <input type="checkbox" name="requiresPrescription" />
          Requires prescription
        </label>
        <Button type="submit" className="md:col-span-3">Add Medicine</Button>
      </form>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Loading medicines...</p>
        ) : medicines.length === 0 ? (
          <p className="text-sm text-slate-500">No medicines found.</p>
        ) : (
          medicines.map((med) => (
            <div key={med.id} className="rounded-xl border bg-white p-4 dark:bg-slate-900">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{med.name}</p>
                  <p className="text-sm text-slate-500">
                    {med.isAvailable ? "Active" : "Inactive"} · {med.quantityInStock} in stock
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => updateMedicine(med.id)} variant="secondary">Save</Button>
                  <Button onClick={() => setRemoveId(med.id)} variant="destructive">Deactivate</Button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <label className="text-sm">
                  Price
                  <input
                    value={drafts[med.id]?.price ?? ""}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [med.id]: { ...prev[med.id], price: e.target.value } }))}
                    className="mt-1 w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                  />
                </label>
                <label className="text-sm">
                  Stock
                  <input
                    value={drafts[med.id]?.quantityInStock ?? ""}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [med.id]: { ...prev[med.id], quantityInStock: e.target.value } }))}
                    className="mt-1 w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                  />
                </label>
                <div className="text-sm">
                  <p>Price preview</p>
                  <p className="mt-1 font-semibold">{formatNaira(Number(drafts[med.id]?.price ?? med.price))}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmationModal
        open={!!removeId}
        title="Deactivate medicine"
        description="This will hide the medicine from the public catalogue and set stock to zero."
        confirmLabel="Deactivate"
        onCancel={() => setRemoveId(null)}
        onConfirm={() => {
          void deactivate();
        }}
      />
    </div>
  );
}
