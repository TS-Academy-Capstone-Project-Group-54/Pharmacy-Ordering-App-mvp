import { db } from "@/db";
import { users } from "@/db/schema";
import { fail, ok } from "@/lib/api";
import { createToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { registerSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    await ensureSeeded();
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return fail("Unable to create your account. Please check all fields.", 400);

    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    const existing = await db.query.users.findFirst({ where: eq(users.email, normalizedEmail) });
    if (existing) return fail("Account already exists with that email.", 409);

    const passwordHash = await hashPassword(parsed.data.password);

    const [created] = await db
      .insert(users)
      .values({
        fullName: parsed.data.fullName.trim(),
        email: normalizedEmail,
        passwordHash,
        phoneNumber: parsed.data.phoneNumber.trim(),
        address: parsed.data.address.trim(),
        role: "customer",
      })
      .returning({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
      });

    const sessionPayload = {
      userId: created.id,
      email: created.email,
      role: created.role,
      fullName: created.fullName,
    } as const;

    const token = await createToken(sessionPayload);
    await setSessionCookie(token);
    return ok("Account created successfully", { ...sessionPayload, token });
  } catch {
    return fail("Unable to create your account.", 500);
  }
}
