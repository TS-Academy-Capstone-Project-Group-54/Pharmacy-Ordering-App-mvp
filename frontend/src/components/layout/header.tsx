"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useTheme } from "@/context/theme-context";
import { SiteSearch } from "@/components/ui/site-search";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/medicines", label: "Medicines" },
    { href: "/cart", label: cartCount > 0 ? `Cart (${cartCount})` : "Cart" },
    ...(user
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/orders", label: "My Orders" },
          { href: "/profile", label: "Profile" },
        ]
      : []),
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
          NaijaCare Pharmacy
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition hover:text-emerald-600",
                isActive(l.href)
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "text-slate-700 dark:text-slate-200",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <SiteSearch />
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            onClick={toggleTheme}
          >
            {theme === "light" ? "Dark" : "Light"}
          </button>
          {!user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-slate-800"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
              >
                {user.fullName.split(" ")[0]}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg bg-slate-200 px-3 py-2 text-sm hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 md:hidden dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Menu
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white p-4 md:hidden dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-3">
            <SiteSearch />
          </div>
          <div className="grid gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800",
                  isActive(l.href) && "bg-emerald-100 font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
                )}
              >
                {l.label}
              </Link>
            ))}
            <button
              type="button"
              className="rounded-lg border px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={toggleTheme}
            >
              Toggle {theme === "light" ? "Dark" : "Light"} mode
            </button>
            {!user ? (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-center text-white hover:bg-emerald-700"
              >
                Login
              </Link>
            ) : (
              <button
                type="button"
                className="rounded-lg bg-slate-200 px-3 py-2 text-left hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"
                onClick={logout}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
