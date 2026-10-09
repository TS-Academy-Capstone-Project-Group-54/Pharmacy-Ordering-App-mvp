import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Delivered: "border border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  Pending: "border border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  Confirmed: "border border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
  Processing: "border border-indigo-200 bg-indigo-100 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300",
  "Ready for Delivery": "border border-violet-200 bg-violet-100 text-violet-800 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-300",
  "Out for Delivery": "border border-cyan-200 bg-cyan-100 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300",
  Cancelled: "border border-red-200 bg-red-100 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        statusStyles[status] ?? "border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
      )}
    >
      {status}
    </span>
  );
}

