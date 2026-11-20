import { db, ensureSchema, json, readBody, validOrigin, passwordMatches, randomToken, sha256, sessionCookie, SESSION_TTL, failure } from "./_lib/auth.js";

export async function onRequestPost({ request, env }) {
  if (!validOrigin(request)) return json({ error: "Origine refusée." }, 403);
  try {
    const body = await readBody(request);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length > 256) return json({ error: "Identifiants invalides." }, 400);
    const sql = db(env);
    await ensureSchema(sql);
    const rows = await sql`SELECT email, password_salt, password_hash FROM mgw_admin WHERE id = 1 AND email = ${email} LIMIT 1`;
    if (!rows.length || !(await passwordMatches(password, rows[0]))) return json({ error: "Adresse e-mail ou mot de passe incorrect." }, 401);
    const token = randomToken();
    await sql`INSERT INTO mgw_sessions (token_hash, expires_at) VALUES (${await sha256(token)}, NOW() + (${SESSION_TTL} * INTERVAL '1 second'))`;
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Set-Cookie": sessionCookie(token) } });
  } catch (error) { return failure(error); }
}
