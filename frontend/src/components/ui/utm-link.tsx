import { withUtm } from "@/lib/utils";

export function OutboundLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={withUtm(href)} target="_blank" rel="noreferrer" className="text-emerald-700 underline hover:text-emerald-600 dark:text-emerald-400">
      {children}
    </a>
  );
}
