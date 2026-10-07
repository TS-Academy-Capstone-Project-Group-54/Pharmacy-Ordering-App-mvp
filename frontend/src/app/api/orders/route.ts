import { db } from "@/db";
import { medicines, orderItems, orders, users } from "@/db/schema";
import { fail, ok } from "@/lib/api";
import { requireAdmin, requireAuth } from "@/lib/route-auth";
import { checkoutSchema } from "@/lib/validators";
import { and, count, desc, eq, ilike, inArray } from "drizzle-orm";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.trim();

  const filters = [] as any[];
  if (status) filters.push(eq(orders.orderStatus, status as any));
  const where = filters.length > 0 ? and(...filters) : undefined;

  const rows = await db
    .select({
      id: orders.id,
      orderStatus: orders.orderStatus,
      paymentStatus: orders.paymentStatus,
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
      customerName: users.fullName,
      customerEmail: users.email,
    })
    .from(orders)
    .leftJoin(users, eq(orders.customerId, users.id))
    .where(where)
    .orderBy(desc(orders.createdAt));

  const filtered = search
    ? rows.filter((r) => r.customerName?.toLowerCase().includes(search.toLowerCase()) || r.id.includes(search))
    : rows;

  const statsRows = await db
    .select({
      totalOrders: count(orders.id),
    })
    .from(orders);

  return ok("Orders loaded", {
    items: filtered,
    stats: {
      totalOrders: statsRows[0]?.totalOrders ?? 0,
      pending: rows.filter((r) => r.orderStatus === "Pending").length,
      processing: rows.filter((r) => r.orderStatus === "Processing").length,
      completed: rows.filter((r) => r.orderStatus === "Delivered").length,
    },
  });
}

export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) return fail("Order could not be placed.", 400);

    const medicineIds = parsed.data.items.map((i) => i.medicineId);
    const medRows = await db.select().from(medicines).where(inArray(medicines.id, medicineIds));

    if (medRows.length !== medicineIds.length) {
      return fail("One or more selected medicines are unavailable.", 400);
    }

    let total = 0;
    const prepared = parsed.data.items.map((item) => {
      const med = medRows.find((m) => m.id === item.medicineId)!;
      const unitPrice = Number(med.price);
      if (!med.isAvailable || med.quantityInStock < item.quantity) {
        throw new Error(`Insufficient stock for ${med.name}`);
      }
      const subtotal = unitPrice * item.quantity;
      total += subtotal;
      return {
        medicineId: med.id,
        medicineName: med.name,
        quantity: item.quantity,
        unitPrice,
        subtotal,
        updatedStock: med.quantityInStock - item.quantity,
      };
    });

    const [createdOrder] = await db
      .insert(orders)
      .values({
        customerId: auth.session.userId,
        totalAmount: String(total),
        deliveryAddress: parsed.data.deliveryAddress,
        phoneNumber: parsed.data.phoneNumber,
        paymentStatus: parsed.data.paymentStatus,
        orderStatus: "Pending",
      })
      .returning();

    for (const p of prepared) {
      await db.insert(orderItems).values({
        orderId: createdOrder.id,
        medicineId: p.medicineId,
        medicineName: p.medicineName,
        quantity: p.quantity,
        unitPrice: String(p.unitPrice),
        subtotal: String(p.subtotal),
      });

      await db.update(medicines).set({ quantityInStock: p.updatedStock, updatedAt: new Date() }).where(eq(medicines.id, p.medicineId));
    }

    return ok("Order placed successfully", createdOrder);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Insufficient stock")) {
      return fail("Insufficient stock.", 400);
    }
    return fail("Order could not be placed.", 500);
  }
}
