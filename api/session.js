import { db, ensureSchema, json, isAuthenticated, failure } from "./_lib/auth.js";

export async function onRequestGet({ request, env }) {
  try {
    const sql = db(env);
    await ensureSchema(sql);
    const users = await sql`SELECT 1 FROM mgw_admin WHERE id = 1 LIMIT 1`;
    return json({ initialized: users.length > 0, authenticated: await isAuthenticated(request, sql) });
  } catch (error) { return failure(error); }
}
