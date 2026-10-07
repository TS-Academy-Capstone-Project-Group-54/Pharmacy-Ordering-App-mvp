"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

export default function AdminCategoriesPage() {
  const { authFetch } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const load = useCallback(async () => {
    const res = await authFetch("/api/categories");
    const payload = await res.json();
    setCategories(payload.data || []);
  }, [authFetch]);

  useEffect(() => {
    void load();
  }, [load]);

  const createCategory = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback("");
    const form = new FormData(e.currentTarget);
    const res = await authFetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.get("name"), description: form.get("description"), isActive: true }),
    });
    const payload = await res.json();
    setFeedback(payload.message);

    if (payload.success) {
      e.currentTarget.reset();
      await load();
    }
  };

  const deactivate = async () => {
    if (!removeId) return;
    const res = await authFetch(`/api/categories/${removeId}`, { method: "DELETE" });
    const payload = await res.json();
    setFeedback(payload.message);
    setRemoveId(null);
    await load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Categories</h1>
      {feedback ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
          {feedback}
        </div>
      ) : null}
      <form className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-3 dark:bg-slate-900" onSubmit={createCategory}>
        <input name="name" required placeholder="Category name" className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <input name="description" required placeholder="Description" className="rounded-lg border px-3 py-2 md:col-span-2 dark:border-slate-700 dark:bg-slate-800" />
        <Button type="submit" className="md:col-span-3">Add Category</Button>
      </form>
      <div className="grid gap-3 md:grid-cols-2">
        {categories.map((c) => (
          <article key={c.id} className="rounded-xl border bg-white p-4 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{c.name}</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs ${c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                {c.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{c.description}</p>
            {c.isActive ? (
              <button onClick={() => setRemoveId(c.id)} className="mt-3 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700">Deactivate</button>
            ) : null}
          </article>
        ))}
      </div>
      <ConfirmationModal open={!!removeId} title="Deactivate category?" description="Customers will not be able to filter by this category." onCancel={() => setRemoveId(null)} onConfirm={deactivate} />
    </div>
  );
}
