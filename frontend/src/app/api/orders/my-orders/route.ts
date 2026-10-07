import { db } from "@/db";
import { orders } from "@/db/schema";
import { ok } from "@/lib/api";
import { requireAuth } from "@/lib/route-auth";
import { desc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const rows = await db.select().from(orders).where(eq(orders.customerId, auth.session.userId)).orderBy(desc(orders.createdAt));
  return ok("My orders loaded", rows);
}
