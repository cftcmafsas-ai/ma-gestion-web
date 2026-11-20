import { db, ensureSchema, json, validOrigin, cookieToken, sha256, clearCookie, failure } from "./_lib/auth.js";

export async function onRequestPost({ request, env }) {
  if (!validOrigin(request)) return json({ error: "Origine refusée." }, 403);
  try {
    const token = cookieToken(request);
    if (token) {
      const sql = db(env);
      await ensureSchema(sql);
      await sql`DELETE FROM mgw_sessions WHERE token_hash = ${await sha256(token)}`;
    }
    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Set-Cookie": clearCookie() } });
  } catch (error) { return failure(error); }
}
