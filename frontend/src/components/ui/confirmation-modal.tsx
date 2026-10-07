"use client";

import { Button } from "@/components/ui/button";

export function ConfirmationModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button className="bg-slate-200 text-slate-900 hover:bg-slate-300" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
