import { db } from "@/db";
import { users } from "@/db/schema";
import { fail, ok } from "@/lib/api";
import { comparePassword, createToken, setSessionCookie } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { loginSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    await ensureSeeded();
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return fail("Invalid email or password.", 400);

    const user = await db.query.users.findFirst({
      where: eq(users.email, parsed.data.email.trim().toLowerCase()),
    });
    if (!user) return fail("Invalid email or password.", 401);

    const valid = await comparePassword(parsed.data.password, user.passwordHash);
    if (!valid) return fail("Invalid email or password.", 401);

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    } as const;
    const token = await createToken(payload);
    await setSessionCookie(token);

    return ok("Logged in successfully", { ...payload, token });
  } catch {
    return fail("Unable to connect to the server.", 500);
  }
}
