"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useTheme } from "@/context/theme-context";
import { SiteSearch } from "@/components/ui/site-search";
import { cn } from "@/lib/utils";

type IconName = "home" | "about" | "medicines" | "cart" | "dashboard" | "orders" | "profile" | "admin" | "login" | "register";

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const common = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  switch (name) {
    case "home": return <svg {...common}><path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9M9 21v-7h6v7"/></svg>;
    case "about": return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>;
    case "medicines": return <svg {...common}><path d="m5 19 14-14a4.2 4.2 0 0 1 6 6L11 25a4.2 4.2 0 0 1-6-6Z" transform="translate(-3 -3)"/><path d="m8 16 8 8"/></svg>;
    case "cart": return <svg {...common}><path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.5L22 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>;
    case "dashboard": return <svg {...common}><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/></svg>;
    case "orders": return <svg {...common}><path d="M6 3h12a2 2 0 0 1 2 2v16H4V5a2 2 0 0 1 2-2Z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>;
    case "profile": return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
    case "admin": return <svg {...common}><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></svg>;
    case "login": return <svg {...common}><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></svg>;
    case "register": return <svg {...common}><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M19 8v6m-3-3h6"/></svg>;
  }
}

function ThemeIcon({ theme }: { theme: "light" | "dark" }) {
  return theme === "light"
    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>
    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5" aria-hidden="true"><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/></svg>;
}

function MenuIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="h-6 w-6"><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
}

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const themeLabel = theme === "light" ? "Switch to dark mode" : "Switch to light mode";
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const links: { href: string; label: string; icon: IconName }[] = [
    { href: "/", label: "Home", icon: "home" },
    { href: "/about", label: "About", icon: "about" },
    { href: "/medicines", label: "Medicines", icon: "medicines" },
    { href: "/cart", label: cartCount ? `Cart (${cartCount})` : "Cart", icon: "cart" },
    ...(user ? [
      { href: "/dashboard", label: "Dashboard", icon: "dashboard" as const },
      { href: "/orders", label: "My Orders", icon: "orders" as const },
      { href: "/profile", label: "Profile", icon: "profile" as const },
    ] : [
      { href: "/login", label: "Login", icon: "login" as const },
      { href: "/register", label: "Register", icon: "register" as const },
    ]),
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin", icon: "admin" as const }] : []),
  ];

  const navLinks = (mobile = false) => links.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      onClick={mobile ? () => setMobileOpen(false) : undefined}
      aria-current={isActive(link.href) ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
        isActive(link.href)
          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
      )}
    >
      <Icon name={link.icon} className="h-5 w-5 shrink-0" />
      <span>{link.label}</span>
      {link.href === "/cart" && cartCount > 0 ? <span className="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">{cartCount}</span> : null}
    </Link>
  ));

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-950 md:flex">
        <Link href="/" className="mb-8 flex items-center gap-3 px-2 text-lg font-bold text-slate-900 dark:text-white">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white" aria-hidden="true">N</span>
          <span>NaijaCare<small className="block text-xs font-normal text-slate-500 dark:text-slate-400">Pharmacy</small></span>
        </Link>
        <nav aria-label="Main navigation" className="flex-1 space-y-1">{navLinks()}</nav>
        <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
          <button type="button" aria-label={themeLabel} onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            <ThemeIcon theme={theme} /><span>{theme === "light" ? "Light Mode" : "Dark Mode"}</span>
          </button>
          {user ? <button type="button" onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><Icon name="login"/><span>Log out</span></button> : null}
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 md:ml-64">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
          <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation menu" aria-expanded={mobileOpen} aria-controls="mobile-sidebar" className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 md:hidden dark:text-slate-200 dark:hover:bg-slate-800"><MenuIcon/></button>
          <Link href="/" className="text-base font-bold text-blue-800 dark:text-blue-300 md:hidden">NaijaCare</Link>
          <div className="ml-auto hidden w-full max-w-sm md:block"><SiteSearch/></div>
          <div className="ml-auto w-full max-w-[min(70vw,22rem)] md:hidden"><SiteSearch/></div>
          <button type="button" aria-label={themeLabel} title={themeLabel} onClick={toggleTheme} className="rounded-lg border border-slate-300 p-2.5 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"><ThemeIcon theme={theme}/></button>
        </div>
      </header>

      {mobileOpen ? <div className="fixed inset-0 z-50 md:hidden">
        <button type="button" aria-label="Close navigation menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-slate-950/50" />
        <aside id="mobile-sidebar" className="relative flex h-full w-[min(18rem,85vw)] flex-col border-r border-slate-200 bg-white px-4 py-5 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-7 flex items-center justify-between">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-lg font-bold text-slate-900 dark:text-white"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white" aria-hidden="true">N</span>NaijaCare</Link>
            <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation menu" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><span aria-hidden="true" className="text-2xl leading-none">×</span></button>
          </div>
          <nav aria-label="Mobile navigation" className="flex-1 space-y-1">{navLinks(true)}</nav>
          <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
            <button type="button" aria-label={themeLabel} onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><ThemeIcon theme={theme}/><span>{theme === "light" ? "Light Mode" : "Dark Mode"}</span></button>
            {user ? <button type="button" onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><Icon name="login"/><span>Log out</span></button> : null}
          </div>
        </aside>
      </div> : null}
    </>
  );
}
