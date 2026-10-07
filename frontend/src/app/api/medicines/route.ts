import { db } from "@/db";
import { categories, medicines } from "@/db/schema";
import { fail, ok } from "@/lib/api";
import { parseMoney } from "@/lib/utils";
import { requireAdmin } from "@/lib/route-auth";
import { ensureSeeded } from "@/lib/seed";
import { medicineSchema } from "@/lib/validators";
import { and, asc, count, eq, gte, ilike, lte, or } from "drizzle-orm";

export async function GET(req: Request) {
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim();
  const category = searchParams.get("category");
  const availability = searchParams.get("availability");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "10");

  const filters = [eq(medicines.isAvailable, true)] as any[];
  if (search) filters.push(or(ilike(medicines.name, `%${search}%`), ilike(medicines.genericName, `%${search}%`)));
  if (category) filters.push(eq(medicines.categoryId, category));
  if (availability === "in-stock") filters.push(gte(medicines.quantityInStock, 1));
  if (availability === "out-of-stock") filters.push(eq(medicines.quantityInStock, 0));
  if (minPrice) filters.push(gte(medicines.price, String(parseMoney(minPrice))));
  if (maxPrice) filters.push(lte(medicines.price, String(parseMoney(maxPrice))));

  const where = and(...filters);
  const offset = (Math.max(page, 1) - 1) * Math.max(limit, 1);

  const [rows, totalRes] = await Promise.all([
    db
      .select({
        id: medicines.id,
        name: medicines.name,
        genericName: medicines.genericName,
        description: medicines.description,
        categoryId: medicines.categoryId,
        categoryName: categories.name,
        price: medicines.price,
        quantityInStock: medicines.quantityInStock,
        dosage: medicines.dosage,
        manufacturer: medicines.manufacturer,
        image: medicines.image,
        expiryDate: medicines.expiryDate,
        requiresPrescription: medicines.requiresPrescription,
        isAvailable: medicines.isAvailable,
      })
      .from(medicines)
      .leftJoin(categories, eq(medicines.categoryId, categories.id))
      .where(where)
      .orderBy(asc(medicines.name))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(medicines).where(where),
  ]);

  const total = totalRes[0]?.count ?? 0;
  return ok("Medicines loaded", {
    items: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const parsed = medicineSchema.safeParse(body);
    if (!parsed.success) return fail("Invalid medicine data", 400);

    const [created] = await db
      .insert(medicines)
      .values({ ...parsed.data, price: String(parsed.data.price), expiryDate: parsed.data.expiryDate })
      .returning();

    return ok("Medicine created successfully", created);
  } catch {
    return fail("Unable to create medicine", 500);
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return fail("Medicine id is required", 400);

  const [updated] = await db
    .update(medicines)
    .set({ isAvailable: false, updatedAt: new Date(), quantityInStock: 0 })
    .where(eq(medicines.id, id))
    .returning();
  if (!updated) return fail("Medicine not found", 404);

  return ok("Medicine deactivated", updated);
}
