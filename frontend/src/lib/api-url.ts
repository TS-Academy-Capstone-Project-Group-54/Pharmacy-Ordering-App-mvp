export function apiUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!base) return path;

  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}
