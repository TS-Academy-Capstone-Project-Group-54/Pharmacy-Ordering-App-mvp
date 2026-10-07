"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FAQSection } from "@/components/ui/faq";
import { CodeSnippet } from "@/components/ui/code-snippet";
import { healthTips, faqs } from "@/data/site-content";
import { safeDate } from "@/lib/utils";
import { MedicineCard } from "@/components/ui/medicine-card";
import { HomeHeroActions } from "@/components/home-hero-actions";
import { apiUrl } from "@/lib/api-url";

export default function HomePage() {
  const [featuredMeds, setFeaturedMeds] = useState<any[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [mRes, cRes] = await Promise.all([
          fetch(apiUrl('/api/medicines?limit=4&page=1')),
          fetch(apiUrl('/api/categories')),
        ]);
        const mPayload = await mRes.json();
        const cPayload = await cRes.json();
        setFeaturedMeds(mPayload?.data?.items ?? []);
        setFeaturedCategories((cPayload?.data ?? []).filter((c: any) => c.isActive).slice(0, 6));
      } catch {
        setFeaturedMeds([]);
        setFeaturedCategories([]);
      }
    })();
  }, []);

  return (
    <div className="space-y-16">
      <section className="grid gap-8 rounded-3xl bg-gradient-to-br from-emerald-100 to-cyan-100 p-6 md:grid-cols-2 md:p-10 dark:from-slate-900 dark:to-slate-800">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Trusted across Nigeria</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight">Order genuine medicines quickly with NaijaCare Pharmacy</h1>
          <p className="mt-3 text-slate-700 dark:text-slate-300">
            Browse, search and place medicine orders in Nigerian Naira (₦). Track fulfilment from Pending to Delivered.
          </p>
          <HomeHeroActions />
        </div>
        <div className="relative h-64 overflow-hidden rounded-2xl">
          <Image src="/images/pharmacy-hero.png" alt="Nigerian pharmacy" fill className="object-cover" />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Featured Categories</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCategories.map((c) => (
            <Link
              key={c.id}
              href={`/medicines?category=${c.id}`}
              className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-400 hover:shadow dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="font-semibold">{c.name}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Popular Medicines</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredMeds.map((m) => (
            <MedicineCard key={m.id} medicine={m} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2" id="health-tips">
        <div>
          <h2 className="text-2xl font-semibold">How ordering works</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
            <li>Register and login to your account.</li>
            <li>Search and add medicines to cart.</li>
            <li>Checkout with delivery details.</li>
            <li>Track your order status until delivery.</li>
          </ol>
          <div className="mt-4 rounded-xl border bg-white p-4 dark:bg-slate-900">
            <p className="text-sm font-semibold">Sample API snippet</p>
            <CodeSnippet code={`GET /api/medicines?search=paracetamol&limit=10&page=1`} />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Health posts</h2>
          <div className="mt-3 space-y-3">
            {healthTips.map((post) => (
              <article key={post.title} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="font-semibold">{post.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{post.excerpt}</p>
                <p className="mt-2 text-xs text-slate-500">Last updated: {safeDate(post.lastUpdated)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-semibold">Frequently Asked Questions</h2>
        <FAQSection items={faqs} />
      </section>

      <section className="rounded-2xl bg-emerald-600 p-6 text-white">
        <h2 className="text-2xl font-semibold">Ready to order?</h2>
        <p className="mt-2 text-sm text-emerald-50">Safe, simple and locally relevant pharmacy ordering for Nigeria.</p>
        <Link href="/medicines" className="mt-4 inline-block rounded-lg bg-white px-4 py-2 font-semibold text-emerald-700 transition hover:bg-emerald-50">
          Start Shopping in ₦
        </Link>
      </section>
    </div>
  );
}
