"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { formatNaira } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

const statuses = ["Pending", "Confirmed", "Processing", "Ready for Delivery", "Out for Delivery", "Delivered", "Cancelled"];

export default function AdminOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const { authFetch } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState("Pending");
  const [savedMessage, setSavedMessage] = useState("");

  const load = useCallback(async () => {
    const res = await authFetch(`/api/orders/${params.id}`);
    const payload = await res.json();
    if (payload.success) {
      setOrder(payload.data);
      setStatus(payload.data.orderStatus);
    }
  }, [authFetch, params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async () => {
    setSavedMessage("");
    const res = await authFetch(`/api/orders/${params.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus: status }),
    });
    const payload = await res.json();
    if (payload.success) {
      setSavedMessage(`Order status updated to "${status}".`);
    }
    await load();
  };

  if (!order) return <p>Loading order details...</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Order #{order.id.slice(0,8).toUpperCase()}</h1>
        <StatusBadge status={order.orderStatus} />
      </div>
      <div className="rounded-xl border bg-white p-4 dark:bg-slate-900">
        <p>Customer delivery: {order.deliveryAddress}</p>
        <p>Phone: {order.phoneNumber}</p>
        <p className="font-semibold">Total: {formatNaira(Number(order.totalAmount))}</p>
      </div>
      <div className="rounded-xl border bg-white p-4 dark:bg-slate-900">
        <h2 className="font-semibold">Items</h2>
        <div className="mt-2 space-y-2 text-sm">
          {order.items.map((i: any) => (
            <div key={i.id} className="flex justify-between"><span>{i.medicineName} × {i.quantity}</span><span>{formatNaira(Number(i.subtotal))}</span></div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border bg-white p-4 dark:bg-slate-900">
        <h2 className="font-semibold">Update Fulfilment Status</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={updateStatus} className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700">Update</button>
        </div>
        {savedMessage ? <p className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">{savedMessage}</p> : null}
      </div>
    </div>
  );
}
