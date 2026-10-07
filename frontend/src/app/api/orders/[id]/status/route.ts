import { db } from "@/db";
import { medicines, orderItems, orders } from "@/db/schema";
import { fail, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/route-auth";
import { orderStatusSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await req.json();
  const parsed = orderStatusSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid order status", 400);

  const existing = await db.query.orders.findFirst({ where: eq(orders.id, id) });
  if (!existing) return fail("Order not found", 404);

  const [updated] = await db
    .update(orders)
    .set({ orderStatus: parsed.data.orderStatus, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();

  if (existing.orderStatus !== "Cancelled" && parsed.data.orderStatus === "Cancelled") {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    for (const item of items) {
      const med = await db.query.medicines.findFirst({ where: eq(medicines.id, item.medicineId) });
      if (!med) continue;
      await db
        .update(medicines)
        .set({ quantityInStock: med.quantityInStock + item.quantity, updatedAt: new Date() })
        .where(eq(medicines.id, item.medicineId));
    }
  }

  return ok("Order status updated", updated);
}
