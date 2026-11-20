import { neon } from "@neondatabase/serverless";

export const SESSION_TTL = 7 * 24 * 60 * 60;
export const COOKIE = "mgw_session";

export function db(env) {
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  return neon(env.DATABASE_URL);
}

export async function ensureSchema(sql) {
  await sql`CREATE TABLE IF NOT EXISTS mgw_admin (
    id SMALLINT PRIMARY KEY CHECK (id = 1),
    email TEXT NOT NULL UNIQUE,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS mgw_sessions (
    token_hash TEXT PRIMARY KEY,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

export function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }
  });
}

export async function readBody(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 8192) throw new Error("Request too large");
  const body = await request.json();
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid body");
  return body;
}

export function validOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; }
  catch { return false; }
}

function b64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function unb64(value) {
  const s = value.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(s + "=".repeat((4 - s.length % 4) % 4)), c => c.charCodeAt(0));
}
export function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return b64(bytes);
}
export async function sha256(value) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2, "0")).join("");
}
export async function passwordRecord(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 310000 }, key, 256);
  return { salt: b64(salt), hash: b64(bits) };
}
export async function passwordMatches(password, record) {
  const salt = unb64(record.password_salt);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 310000 }, key, 256);
  const a = new Uint8Array(bits), b = unb64(record.password_hash);
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
export function cookieToken(request) {
  const cookie = request.headers.get("Cookie") || "";
  const part = cookie.split(";").map(x => x.trim()).find(x => x.startsWith(COOKIE + "="));
  return part ? decodeURIComponent(part.slice(COOKIE.length + 1)) : "";
}
export function sessionCookie(token) {
  return COOKIE + "=" + encodeURIComponent(token) + "; Path=/; Max-Age=" + SESSION_TTL + "; HttpOnly; Secure; SameSite=Strict";
}
export function clearCookie() {
  return COOKIE + "=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict";
}
export async function isAuthenticated(request, sql) {
  const token = cookieToken(request);
  if (!token) return false;
  const hash = await sha256(token);
  const rows = await sql`SELECT 1 FROM mgw_sessions WHERE token_hash = ${hash} AND expires_at > NOW() LIMIT 1`;
  return rows.length > 0;
}
export function failure(error) {
  console.error("Authentication error:", error?.message || "unknown");
  return json({ error: "Service d’authentification momentanément indisponible." }, 503);
}
