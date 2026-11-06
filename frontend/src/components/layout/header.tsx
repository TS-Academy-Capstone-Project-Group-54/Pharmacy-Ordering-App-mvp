"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useTheme } from "@/context/theme-context";
import { SiteSearch } from "@/components/ui/site-search";
import { cn } from "@/lib/utils";

type NavIconName = "home" | "about" | "medicines" | "cart" | "dashboard" | "orders" | "profile" | "admin";

function NavIcon({ name, className }: { name: NavIconName; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "home":
      return <svg {...common}><path d="m3 10 9-7 9 7" /><path d="M5 9v12h14V9M9 21v-7h6v7" /></svg>;
    case "about":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>;
    case "medicines":
      return <svg {...common}><path d="m4.9 19.1 14.2-14.2a4.2 4.2 0 0 1 5.9 5.9L10.8 25a4.2 4.2 0 0 1-5.9-5.9Z" transform="translate(-2 -2)" /><path d="m8 16 8 8" /></svg>;
    case "cart":
      return <svg {...common}><path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.5L22 8H6" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>;
    case "dashboard":
      return <svg {...common}><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="5" rx="1.5" /><rect x="13" y="10" width="8" height="11" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /></svg>;
    case "orders":
      return <svg {...common}><path d="M6 3h12a2 2 0 0 1 2 2v16H4V5a2 2 0 0 1 2-2Z" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>;
    case "profile":
      return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
    case "admin":
      return <svg {...common}><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></svg>;
  }
}

function ThemeIcon({ theme }: { theme: "light" | "dark" }) {
  return theme === "light" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
      <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="h-5 w-5">
      {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const links: { href: string; label: string; icon: NavIconName }[] = [
    { href: "/", label: "Home", icon: "home" },
    { href: "/about", label: "About", icon: "about" },
    { href: "/medicines", label: "Medicines", icon: "medicines" },
    { href: "/cart", label: cartCount > 0 ? `Cart (${cartCount})` : "Cart", icon: "cart" },
    ...(user
      ? [
          { href: "/dashboard", label: "Dashboard", icon: "dashboard" as const },
          { href: "/orders", label: "My Orders", icon: "orders" as const },
          { href: "/profile", label: "Profile", icon: "profile" as const },
        ]
      : []),
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin", icon: "admin" as const }] : []),
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const themeLabel = theme === "light" ? "Switch to dark mode" : "Switch to light mode";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
          NaijaCare Pharmacy
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.label}
              title={link.label}
              className={cn(
                "rounded-lg p-2.5 transition hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300",
                isActive(link.href)
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "text-slate-700 dark:text-slate-200",
              )}
            >
              <NavIcon name={link.icon} className="h-5 w-5" />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <SiteSearch />
          <button
            type="button"
            aria-label={themeLabel}
            title={themeLabel}
            className="rounded-lg border border-slate-300 p-2.5 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-slate-700 dark:hover:bg-slate-800"
            onClick={toggleTheme}
          >
            <ThemeIcon theme={theme} />
          </button>
          {!user ? (
            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">Login</Link>
              <Link href="/register" className="rounded-lg border border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-slate-800">Register</Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300">{user.fullName.split(" ")[0]}</Link>
              <button type="button" onClick={logout} className="rounded-lg bg-slate-200 px-3 py-2 text-sm hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700">Logout</button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          className="rounded-lg border border-slate-300 p-2.5 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 md:hidden dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <MenuIcon open={mobileOpen} />
        </button>
      </div>

      {mobileOpen ? (
        <div id="mobile-navigation" className="border-t border-slate-200 bg-white p-4 md:hidden dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-3"><SiteSearch /></div>
          <nav aria-label="Mobile navigation" className="grid gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800",
                  isActive(link.href) && "bg-emerald-100 font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
                )}
              >
                <NavIcon name={link.icon} className="h-5 w-5 shrink-0" />
                <span>{link.label}</span>
              </Link>
            ))}
            <button
              type="button"
              aria-label={themeLabel}
              onClick={toggleTheme}
              className="flex items-center gap-3 rounded-lg border border-slate-300 px-3 py-2.5 text-left hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <ThemeIcon theme={theme} />
              <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
            </button>
            {!user ? (
              <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-lg bg-emerald-600 px-3 py-2 text-center text-white hover:bg-emerald-700">Login</Link>
            ) : (
              <button type="button" className="rounded-lg bg-slate-200 px-3 py-2 text-left hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700" onClick={logout}>Logout</button>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
