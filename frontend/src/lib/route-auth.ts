import { getSession } from "@/lib/auth";
import { fail } from "@/lib/api";

export async function requireAuth(req?: Request) {
  const session = await getSession();
  if (session) return { error: null, session } as const;

  return { error: fail("Authentication required", 401), session: null } as const;
}

export async function requireAdmin(req?: Request) {
  const auth = await requireAuth(req);
  if (auth.error) return auth;
  if (auth.session.role !== "admin") {
    return { error: fail("You do not have permission to perform this action.", 403), session: null } as const;
  }
  return { error: null, session: auth.session } as const;
}
