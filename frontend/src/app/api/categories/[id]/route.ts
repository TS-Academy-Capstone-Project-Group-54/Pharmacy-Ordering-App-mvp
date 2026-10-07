import { db } from "@/db";
import { categories } from "@/db/schema";
import { fail, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/route-auth";
import { categorySchema } from "@/lib/validators";
import { eq } from "drizzle-orm";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await db.query.categories.findFirst({ where: eq(categories.id, id) });
  if (!category) return fail("Category not found", 404);
  return ok("Category loaded", category);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) return fail("Invalid category data", 400);

  const [updated] = await db.update(categories).set({ ...parsed.data, updatedAt: new Date() }).where(eq(categories.id, id)).returning();
  if (!updated) return fail("Category not found", 404);
  return ok("Category updated successfully", updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const { id } = await params;
  const [updated] = await db.update(categories).set({ isActive: false, updatedAt: new Date() }).where(eq(categories.id, id)).returning();
  if (!updated) return fail("Category not found", 404);
  return ok("Category deactivated", updated);
}
