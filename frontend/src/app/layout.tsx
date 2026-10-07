import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteShell } from "@/components/layout/site-shell";

export const metadata: Metadata = {
  title: "NaijaCare Pharmacy Ordering App",
  description: "Nigerian pharmacy ordering platform for customers and admins.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const earlyRestoreScript = `
    (function () {
      try {
        var path = window.location.pathname;
        var current = window.location.pathname + window.location.search;
        if (path !== '/') return;

        var lastKey = 'group54-last-path';
        var refreshKey = 'group54-refresh-marker';

        var hasRefreshMarker = sessionStorage.getItem(refreshKey) === '1';
        if (!hasRefreshMarker) return;

        var lastPath = sessionStorage.getItem(lastKey) || localStorage.getItem(lastKey);
        sessionStorage.removeItem(refreshKey);

        if (!lastPath || lastPath === '/' || lastPath.indexOf('/?') === 0 || lastPath.indexOf('/login') === 0 || lastPath.indexOf('/register') === 0) return;
        if (lastPath === current) return;

        document.documentElement.classList.add('route-restoring');
        window.location.replace(lastPath);
      } catch (e) {
        // no-op
      }
    })();
  `;

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{ __html: earlyRestoreScript }} />
      </head>
      <body className="bg-slate-100 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
