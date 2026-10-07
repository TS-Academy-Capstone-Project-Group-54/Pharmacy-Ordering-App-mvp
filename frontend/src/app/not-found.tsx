import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">404</p>
        <h1 className="mt-2 text-3xl font-bold">This page took a wrong turn in Lagos traffic 🚦</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Sorry, we couldn’t find what you were looking for. Let’s get you back to medicines.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Go Home</Link>
          <Link href="/medicines" className="rounded-xl border px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">Browse Medicines</Link>
        </div>
      </div>
    </div>
  );
}
