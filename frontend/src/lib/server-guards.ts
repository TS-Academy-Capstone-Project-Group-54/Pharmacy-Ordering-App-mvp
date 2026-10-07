import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireUserPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");
  return session;
}
