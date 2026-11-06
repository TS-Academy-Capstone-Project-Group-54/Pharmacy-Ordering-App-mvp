import { createHash } from "node:crypto";
import { pool } from "@/db";
import { fail, ok } from "@/lib/api";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("The reset link is invalid or has expired. Request a new one.", 400);
  }

  const token = typeof (body as { token?: unknown })?.token === "string" ? (body as { token: string }).token : "";
  const password = typeof (body as { password?: unknown })?.password === "string" ? (body as { password: string }).password : "";
  if (!token || token.length > 200 || password.length < 8 || password.length > 128) {
    return fail("Use a valid reset link and a password between 8 and 128 characters.", 400);
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const passwordHash = await hashPassword(password);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const reset = await client.query(
      "SELECT user_id FROM password_reset_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now() FOR UPDATE",
      [tokenHash],
    );
    if (reset.rowCount !== 1) {
      await client.query("ROLLBACK");
      return fail("The reset link is invalid or has expired. Request a new one.", 400);
    }

    const userId = reset.rows[0].user_id;
    await client.query("UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2", [passwordHash, userId]);
    await client.query("UPDATE password_reset_tokens SET used_at = now() WHERE user_id = $1 AND used_at IS NULL", [userId]);
    await client.query("COMMIT");
    return ok("Password updated", { message: "Your password has been changed. You can now sign in." });
  } catch {
    await client.query("ROLLBACK");
    return fail("Password reset is temporarily unavailable. Please try again later.", 503);
  } finally {
    client.release();
  }
}
