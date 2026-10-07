import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { fail } from "@/lib/api";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

type HeaderSession = {
  userId?: string;
  email?: string;
  role?: "customer" | "admin";
  fullName?: string;
};

function parseRequestHints(req?: Request): HeaderSession {
  if (!req) return {};
  const roleRaw = (req.headers.get("x-user-role") ?? undefined) as "customer" | "admin" | undefined;
  const role = roleRaw === "customer" || roleRaw === "admin" ? roleRaw : undefined;

  const fromHeader: HeaderSession = {
    userId: req.headers.get("x-user-id") ?? undefined,
    email: req.headers.get("x-user-email")?.toLowerCase() ?? undefined,
    role,
    fullName: req.headers.get("x-user-name") ?? undefined,
  };

  if (fromHeader.userId || fromHeader.email || fromHeader.role) return fromHeader;

  // Backup channel via query params
  const url = new URL(req.url);
  const qpRoleRaw = (url.searchParams.get("auth_user_role") ?? undefined) as "customer" | "admin" | undefined;
  const qpRole = qpRoleRaw === "customer" || qpRoleRaw === "admin" ? qpRoleRaw : undefined;

  return {
    userId: url.searchParams.get("auth_user_id") ?? undefined,
    email: url.searchParams.get("auth_user_email")?.toLowerCase() ?? undefined,
    role: qpRole,
    fullName: url.searchParams.get("auth_user_name") ?? undefined,
  };
}

async function fallbackHeaderSession(req?: Request) {
  const hint = parseRequestHints(req);

  let user: any = null;
  if (hint.userId) {
    user = await db.query.users.findFirst({ where: eq(users.id, hint.userId) });
  }
  if (!user && hint.email) {
    user = await db.query.users.findFirst({ where: eq(users.email, hint.email) });
  }

  // last-resort attempt from server header bag
  if (!user) {
    const hdrs = await headers();
    const email = hdrs.get("x-user-email")?.toLowerCase();
    const userId = hdrs.get("x-user-id");

    if (userId) user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user && email) user = await db.query.users.findFirst({ where: eq(users.email, email) });
  }

  if (!user) return null;
  if (hint.role && user.role !== hint.role) return null;

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  } as const;
}

export async function requireAuth(req?: Request) {
  const fallback = await fallbackHeaderSession(req);
  if (fallback) return { error: null, session: fallback } as const;

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
  return auth;
}
