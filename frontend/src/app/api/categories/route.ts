import { db } from "@/db";
import { categories } from "@/db/schema";
import { fail, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/route-auth";
import { categorySchema } from "@/lib/validators";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(categories).orderBy(desc(categories.createdAt));
  return ok("Categories loaded", rows);
}

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) return fail("Invalid category data", 400);

    const [created] = await db.insert(categories).values(parsed.data).returning();
    return ok("Category created successfully", created);
  } catch {
    return fail("Unable to create category", 500);
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return fail("Category id is required", 400);

  const [updated] = await db.update(categories).set({ isActive: false, updatedAt: new Date() }).where(eq(categories.id, id)).returning();
  if (!updated) return fail("Category not found", 404);
  return ok("Category deactivated", updated);
}
