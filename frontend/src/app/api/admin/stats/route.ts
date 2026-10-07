import { db } from "@/db";
import { medicines, orders, users } from "@/db/schema";
import { ok } from "@/lib/api";
import { requireAdmin } from "@/lib/route-auth";
import { ensureSeeded } from "@/lib/seed";
import { count, eq } from "drizzle-orm";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  await ensureSeeded();

  const [totalMedicines, totalCustomers, totalOrders, pendingOrders, processingOrders, completedOrders] =
    await Promise.all([
      db.select({ c: count() }).from(medicines),
      db.select({ c: count() }).from(users).where(eq(users.role, "customer")),
      db.select({ c: count() }).from(orders),
      db.select({ c: count() }).from(orders).where(eq(orders.orderStatus, "Pending")),
      db.select({ c: count() }).from(orders).where(eq(orders.orderStatus, "Processing")),
      db.select({ c: count() }).from(orders).where(eq(orders.orderStatus, "Delivered")),
    ]);

  return ok("Admin statistics loaded", {
    totalMedicines: totalMedicines[0]?.c ?? 0,
    totalCustomers: totalCustomers[0]?.c ?? 0,
    pendingOrders: pendingOrders[0]?.c ?? 0,
    processingOrders: processingOrders[0]?.c ?? 0,
    completedOrders: completedOrders[0]?.c ?? 0,
    totalOrders: totalOrders[0]?.c ?? 0,
  });
}
