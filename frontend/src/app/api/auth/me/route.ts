import { fail, ok } from "@/lib/api";
import { createToken, getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("Authentication required", 401);

  const token = await createToken(session);
  return ok("Current user", { ...session, token });
}
