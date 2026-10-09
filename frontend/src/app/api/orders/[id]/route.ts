import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { fail, ok } from "@/lib/api";
import { requireAuth } from "@/lib/route-auth";
import { eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const { id } = await params;

  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) });
  if (!order) return fail("Order not found", 404);

  if (auth.session.role !== "admin" && order.customerId !== auth.session.userId) {
    return fail("You do not have permission to perform this action.", 403);
  }

  const items = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      medicineId: orderItems.medicineId,
      medicineName: orderItems.medicineName,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      subtotal: orderItems.subtotal,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  return ok("Order details loaded", { ...order, items });
}
