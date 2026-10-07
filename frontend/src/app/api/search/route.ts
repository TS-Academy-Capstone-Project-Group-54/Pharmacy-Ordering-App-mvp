import { db } from "@/db";
import { categories, medicines } from "@/db/schema";
import { ok } from "@/lib/api";
import { and, ilike, or, eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return ok("Search results", { medicines: [], categories: [], faqs: [], posts: [] });
  }

  const [medRows, categoryRows] = await Promise.all([
    db
      .select({ id: medicines.id, name: medicines.name, genericName: medicines.genericName })
      .from(medicines)
      .where(and(or(ilike(medicines.name, `%${q}%`), ilike(medicines.genericName, `%${q}%`)), eq(medicines.isAvailable, true)))
      .limit(6),
    db.select({ id: categories.id, name: categories.name }).from(categories).where(ilike(categories.name, `%${q}%`)).limit(4),
  ]);

  const faqs = [
    { id: "faq-1", question: "How do I place an order in Nigeria?", href: "/about#faq" },
    { id: "faq-2", question: "Do you deliver across Lagos and Abuja?", href: "/about#faq" },
  ].filter((f) => f.question.toLowerCase().includes(q.toLowerCase()));

  const posts = [
    { id: "tip-1", title: "Managing cold and flu season in Nigeria", href: "/about#health-tips", lastUpdated: "2026-01-10" },
    { id: "tip-2", title: "Safe medicine storage during hot weather", href: "/about#health-tips", lastUpdated: "2026-01-18" },
  ].filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));

  return ok("Search results", {
    medicines: medRows,
    categories: categoryRows,
    faqs,
    posts,
  });
}
