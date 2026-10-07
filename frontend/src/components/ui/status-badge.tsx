import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "Delivered" && "bg-emerald-100 text-emerald-700",
        status === "Pending" && "bg-amber-100 text-amber-700",
        status === "Processing" && "bg-blue-100 text-blue-700",
        status === "Cancelled" && "bg-red-100 text-red-700",
        !(status === "Delivered" || status === "Pending" || status === "Processing" || status === "Cancelled") &&
          "bg-slate-200 text-slate-700",
      )}
    >
      {status}
    </span>
  );
}
