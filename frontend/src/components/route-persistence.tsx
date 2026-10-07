"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const LAST_PATH_KEY = "group54-last-path";
const REFRESH_MARKER_KEY = "group54-refresh-marker";

function setLastPath(path: string) {
  try {
    localStorage.setItem(LAST_PATH_KEY, path);
    sessionStorage.setItem(LAST_PATH_KEY, path);
  } catch {
    // Ignore storage errors
  }
}

function getLastPath(): string | null {
  try {
    return sessionStorage.getItem(LAST_PATH_KEY) || localStorage.getItem(LAST_PATH_KEY);
  } catch {
    return null;
  }
}

export function RoutePersistence() {
  const pathname = usePathname();
  const router = useRouter();

  const hasAttemptedRestoreRef = useRef(false);
  const isRestoringRef = useRef(false);

  const markRestoring = (active: boolean) => {
    try {
      document.documentElement.classList.toggle("route-restoring", active);
    } catch {
      // Ignore DOM errors
    }
  };

  // 1) Attempt restore first on initial mount before any write.
  useEffect(() => {
    if (hasAttemptedRestoreRef.current) return;
    hasAttemptedRestoreRef.current = true;

    const lastPath = getLastPath();
    const refreshMarker = sessionStorage.getItem(REFRESH_MARKER_KEY) === "1";

    if (
      refreshMarker &&
      pathname === "/" &&
      lastPath &&
      lastPath !== "/" &&
      !lastPath.startsWith("/?") &&
      !lastPath.startsWith("/login") &&
      !lastPath.startsWith("/register")
    ) {
      isRestoringRef.current = true;
      markRestoring(true);
      sessionStorage.removeItem(REFRESH_MARKER_KEY);
      router.replace(lastPath);
      return;
    }

    sessionStorage.removeItem(REFRESH_MARKER_KEY);
    markRestoring(false);
  }, [pathname, router]);

  // 2) Persist current route, but avoid clobbering stored path during restore.
  useEffect(() => {
    if (!pathname) return;

    if (isRestoringRef.current && pathname === "/") {
      return;
    }

    const query = typeof window !== "undefined" ? window.location.search : "";
    const full = `${pathname}${query}`;
    setLastPath(full);

    if (isRestoringRef.current && pathname !== "/") {
      isRestoringRef.current = false;
      markRestoring(false);
    }

    if (!isRestoringRef.current) {
      markRestoring(false);
    }
  }, [pathname]);

  // 3) Mark true refresh/navigation-away attempts and persist exact route.
  useEffect(() => {
    const onBeforeUnload = () => {
      try {
        const full = `${window.location.pathname}${window.location.search}`;
        setLastPath(full);
        sessionStorage.setItem(REFRESH_MARKER_KEY, "1");
      } catch {
        // Ignore
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  return null;
}
