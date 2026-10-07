"use client";

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
      authFetch("/api/medicines?limit=100"),
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
        image: med.image?.startsWith("http") ? med.image : "https://naijacare.example/images/pharmacy-hero.png",
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

      <form onSubmit={createMedicine} className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-2 dark:bg-slate-900">
        <input name="name" required placeholder="Medicine Name" className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <input name="genericName" required placeholder="Generic Name" className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <input name="manufacturer" required placeholder="Manufacturer" className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <input name="dosage" required placeholder="Dosage" className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <input name="price" type="number" min="1" step="0.01" required placeholder="Price in ₦" className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <input name="quantityInStock" type="number" min="0" required placeholder="Stock Quantity" className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <input name="image" defaultValue="/images/pharmacy-hero.png" required placeholder="Image URL or /images/path" className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <input name="expiryDate" type="date" required className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <select name="categoryId" className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
          <option value="">Select category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="requiresPrescription" /> Requires Prescription</label>
        <textarea name="description" required placeholder="Description (at least 10 characters)" className="md:col-span-2 rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <Button className="md:col-span-2" type="submit">Add Medicine</Button>
      </form>

      {loading ? <p>Loading medicines...</p> : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:bg-slate-900">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Price (₦)</th>
                <th className="p-3 text-left">Stock</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((m) => (
                <tr key={m.id} className="border-t dark:border-slate-800">
                  <td className="p-3">
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-slate-500">{formatNaira(Number(m.price))}</div>
                  </td>
                  <td className="p-3">{m.categoryName ?? "Uncategorized"}</td>
                  <td className="p-3">
                    <input
                      value={drafts[m.id]?.price ?? String(Number(m.price))}
                      onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: { ...d[m.id], price: e.target.value } }))}
                      className="w-24 rounded border px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      value={drafts[m.id]?.quantityInStock ?? String(m.quantityInStock)}
                      onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: { ...d[m.id], quantityInStock: e.target.value } }))}
                      className="w-20 rounded border px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </td>
                  <td className="space-x-2 p-3">
                    <button onClick={() => updateMedicine(m.id)} className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700">Save</button>
                    <button onClick={() => setRemoveId(m.id)} className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700">Deactivate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationModal
        open={!!removeId}
        title="Deactivate medicine?"
        description="This medicine will no longer be visible to customers."
        confirmLabel="Deactivate"
        onCancel={() => setRemoveId(null)}
        onConfirm={deactivate}
      />
    </div>
  );
}
