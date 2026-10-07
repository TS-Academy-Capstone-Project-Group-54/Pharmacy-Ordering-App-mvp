import { db } from "@/db";
import { categories, medicines, users } from "@/db/schema";
import { fail, ok } from "@/lib/api";
import { ensureSeeded } from "@/lib/seed";
import { count } from "drizzle-orm";

export async function POST(req: Request) {
  const key = req.headers.get("x-seed-key");
  if (process.env.SEED_KEY && key !== process.env.SEED_KEY) {
    return fail("Unauthorized seed request", 401);
  }

  await ensureSeeded();

  const [userCount, catCount, medCount] = await Promise.all([
    db.select({ c: count() }).from(users),
    db.select({ c: count() }).from(categories),
    db.select({ c: count() }).from(medicines),
  ]);

  return ok("Database seeded successfully", {
    users: userCount[0]?.c ?? 0,
    categories: catCount[0]?.c ?? 0,
    medicines: medCount[0]?.c ?? 0,
    loginHints: {
      adminEmail: "admin@naijacare.com",
      adminPassword: "Admin123!",
      customerEmail: "customer@naijacare.com",
      customerPassword: "Customer123!",
    },
  });
}

export async function GET() {
  await ensureSeeded();
  const [userCount, catCount, medCount] = await Promise.all([
    db.select({ c: count() }).from(users),
    db.select({ c: count() }).from(categories),
    db.select({ c: count() }).from(medicines),
  ]);
  return ok("Seed status", {
    hasData: (medCount[0]?.c ?? 0) > 0,
    users: userCount[0]?.c ?? 0,
    categories: catCount[0]?.c ?? 0,
    medicines: medCount[0]?.c ?? 0,
  });
}
