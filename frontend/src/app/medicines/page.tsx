"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MedicineCard } from "@/components/ui/medicine-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiUrl } from "@/lib/api-url";

export default function MedicinesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [rows, setRows] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [availability, setAvailability] = useState(searchParams.get("availability") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  const load = async (query: URLSearchParams) => {
    setLoading(true);
    const [medRes, catRes] = await Promise.all([
      fetch(apiUrl(`/api/medicines?${query.toString()}`)),
      fetch(apiUrl('/api/categories')),
    ]);
    const medPayload = await medRes.json();
    const catPayload = await catRes.json();
    setRows(medPayload?.data?.items ?? []);
    setCats((catPayload?.data ?? []).filter((c: any) => c.isActive));
    setLoading(false);
  };

  useEffect(() => {
    const q = new URLSearchParams();
    if (searchParams.get("search")) q.set("search", searchParams.get("search")!);
    if (searchParams.get("category")) q.set("category", searchParams.get("category")!);
    if (searchParams.get("availability")) q.set("availability", searchParams.get("availability")!);
    if (searchParams.get("minPrice")) q.set("minPrice", searchParams.get("minPrice")!);
    if (searchParams.get("maxPrice")) q.set("maxPrice", searchParams.get("maxPrice")!);
    q.set("page", "1");
    q.set("limit", "36");
    void load(q);
  }, [searchParams]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    if (category) q.set("category", category);
    if (availability) q.set("availability", availability);
    if (minPrice) q.set("minPrice", minPrice);
    if (maxPrice) q.set("maxPrice", maxPrice);
    router.push(`/medicines?${q.toString()}`);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Medicine Catalogue</h1>
      <form onSubmit={onSubmit} className="mt-4 grid gap-2 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-5 dark:border-slate-800 dark:bg-slate-900">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or generic name" className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
          <option value="">All categories</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
          <option value="">All availability</option>
          <option value="in-stock">In stock</option>
          <option value="out-of-stock">Out of stock</option>
        </select>
        <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} type="number" min="0" placeholder="Min ₦" className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} type="number" min="0" placeholder="Max ₦" className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
        <button className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700 md:col-span-5">Apply Filters</button>
      </form>

      {loading ? (
        <div className="mt-5"><LoadingSpinner label="Loading medicines..." /></div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.length ? rows.map((m) => <MedicineCard key={m.id} medicine={m} />) : <EmptyState title="No medicines found." subtitle="Try another search or filter." />}
        </div>
      )}
    </div>
  );
}
