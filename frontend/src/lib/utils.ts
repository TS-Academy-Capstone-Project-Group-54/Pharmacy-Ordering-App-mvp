export function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function parseMoney(value: string | number): number {
  return Number.parseFloat(String(value));
}

export function withUtm(url: string) {
  if (!url.startsWith("http")) return url;
  const u = new URL(url);

  // WhatsApp deep links are sensitive to extra query params.
  if (u.hostname.includes("wa.me") || u.hostname.includes("api.whatsapp.com")) {
    return url;
  }

  u.searchParams.set("utm_source", "group54_pharmacy_app");
  u.searchParams.set("utm_medium", "outbound_link");
  u.searchParams.set("utm_campaign", "capstone_mvp");
  return u.toString();
}

export function safeDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function medicineImageFor(id: string, fallback?: string) {
  const raw = fallback?.trim();
  if (raw && raw.startsWith("http")) return raw;
  if (raw && raw.startsWith("/") && raw !== "/images/pharmacy-hero.png") return raw;
  return `https://picsum.photos/seed/naijacare-${id}/640/420`;
}
