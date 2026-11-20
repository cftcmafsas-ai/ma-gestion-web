import { db, ensureSchema, json, readBody, validOrigin, passwordRecord, randomToken, sha256, sessionCookie, SESSION_TTL, failure } from "./_lib/auth.js";

export async function onRequestPost({ request, env }) {
  if (!validOrigin(request)) return json({ error: "Origine refusée." }, 403);
  try {
    const body = await readBody(request);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const confirmation = String(body.confirmation || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Adresse e-mail invalide." }, 400);
    if (password.length < 12 || password.length > 256) return json({ error: "Choisissez un mot de passe d’au moins 12 caractères." }, 400);
    if (password !== confirmation) return json({ error: "Les deux mots de passe ne correspondent pas." }, 400);
    const sql = db(env);
    await ensureSchema(sql);
    const record = await passwordRecord(password);
    const rows = await sql`INSERT INTO mgw_admin (id, email, password_salt, password_hash)
      VALUES (1, ${email}, ${record.salt}, ${record.hash})
      ON CONFLICT (id) DO NOTHING RETURNING id`;
    if (!rows.length) return json({ error: "Le compte administrateur est déjà créé." }, 409);
    const token = randomToken();
    await sql`INSERT INTO mgw_sessions (token_hash, expires_at) VALUES (${await sha256(token)}, NOW() + (${SESSION_TTL} * INTERVAL '1 second'))`;
    return new Response(JSON.stringify({ ok: true }), { status: 201, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Set-Cookie": sessionCookie(token) } });
  } catch (error) { return failure(error); }
}
