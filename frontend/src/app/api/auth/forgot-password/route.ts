import { createHash, randomBytes } from "node:crypto";
import { db, pool } from "@/db";
import { users } from "@/db/schema";
import { fail, ok } from "@/lib/api";
import { eq } from "drizzle-orm";

const GENERIC_RESPONSE = "If an account exists for that email, a password reset link will be sent shortly.";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PASSWORD_RESET_FROM_EMAIL;
  const appUrl = process.env.APP_URL;
  if (!apiKey || !from || !appUrl) {
    return fail("Password reset is not configured. Please contact the pharmacy administrator.", 503);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Enter a valid email address.", 400);
  }
  const email = typeof (body as { email?: unknown })?.email === "string"
    ? (body as { email: string }).email.trim().toLowerCase()
    : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return fail("Enter a valid email address.", 400);
  }

  let user;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        token_hash text PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        used_at timestamptz
      )
    `);
    user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) return ok("Password reset requested", { message: GENERIC_RESPONSE });

    const recent = await pool.query(
      "SELECT 1 FROM password_reset_tokens WHERE user_id = $1 AND created_at > now() - interval '1 minute' LIMIT 1",
      [user.id],
    );
    if (recent.rowCount) return ok("Password reset requested", { message: GENERIC_RESPONSE });

    const token = randomBytes(32).toString("base64url");
    const tokenHash = hashToken(token);
    await pool.query(
      "INSERT INTO password_reset_tokens (token_hash, user_id, expires_at) VALUES ($1, $2, now() + interval '30 minutes')",
      [tokenHash, user.id],
    );

    const resetUrl = new URL("/reset-password", appUrl);
    resetUrl.searchParams.set("token", token);
    const mailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [user.email],
        subject: "Reset your NaijaCare password",
        text: `We received a request to reset your NaijaCare password. Use this link within 30 minutes: ${resetUrl.toString()}\n\nIf you did not request this, you can ignore this email.`,
        html: `<p>We received a request to reset your NaijaCare password.</p><p><a href="${resetUrl.toString()}">Choose a new password</a></p><p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>`,
      }),
    });

    if (!mailResponse.ok) {
      await pool.query("UPDATE password_reset_tokens SET used_at = now() WHERE token_hash = $1", [tokenHash]);
      return fail("Password reset email could not be sent. Please try again later.", 503);
    }

    return ok("Password reset requested", { message: GENERIC_RESPONSE });
  } catch {
    return fail("Password reset is temporarily unavailable. Please try again later.", 503);
  }
}
