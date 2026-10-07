import { db } from "@/db";
import { users } from "@/db/schema";
import { fail, ok } from "@/lib/api";
import { profileSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/route-auth";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const user = await db.query.users.findFirst({
    where: eq(users.id, auth.session.userId),
    columns: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      address: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) return fail("User not found", 404);
  return ok("Profile loaded", user);
}

export async function PUT(req: Request) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) return fail("Invalid profile data", 400);

    const [updated] = await db
      .update(users)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(users.id, auth.session.userId))
      .returning({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        phoneNumber: users.phoneNumber,
        address: users.address,
        role: users.role,
      });

    return ok("Profile updated successfully", updated);
  } catch {
    return fail("Unable to update profile", 500);
  }
}
