const { randomBytes, createHash, createHmac, scryptSync, timingSafeEqual } = require("node:crypto");
const SESSION_TTL = 7 * 24 * 60 * 60;
const COOKIE = "mgw_session";
function config() {
  const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token, AUTH_SESSION_SECRET: secret, AUTH_SETUP_TOKEN: setup } = process.env;
  if (!url || !token || !secret) throw new Error("Authentication configuration incomplete");
  return { url: url.replace(/\/$/, ""), token, secret, setup };
}
async function redis(command) {
  const c = config();
  const response = await fetch(c.url, { method: "POST", headers: { Authorization: "Bearer " + c.token, "Content-Type": "application/json" }, body: JSON.stringify(command) });
  if (!response.ok) throw new Error("Storage service unavailable");
  const data = await response.json();
  if (data.error) throw new Error("Storage operation failed");
  return data.result;
}
function json(res, status, body) { res.statusCode=status; res.setHeader("Content-Type","application/json; charset=utf-8"); res.setHeader("Cache-Control","no-store"); res.end(JSON.stringify(body)); }
function parseBody(req) { return new Promise((resolve,reject)=>{let s="";req.on("data",c=>{s+=c;if(s.length>8192)reject(new Error("Request too large"));});req.on("end",()=>{try{resolve(JSON.parse(s||"{}"));}catch{reject(new Error("Invalid JSON"));}});}); }
function validOrigin(req) {
  const origin=req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}
function cookieValue(req) {
  const raw=req.headers.cookie||"";
  const part=raw.split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"="));
  return part ? decodeURIComponent(part.slice(COOKIE.length+1)) : "";
}
function tokenHash(token) { return createHmac("sha256",config().secret).update(token).digest("hex"); }
function setSessionCookie(res, token) {
  res.setHeader("Set-Cookie", COOKIE+"="+encodeURIComponent(token)+"; Path=/; Max-Age="+SESSION_TTL+"; HttpOnly; Secure; SameSite=Strict");
}
function clearSessionCookie(res) { res.setHeader("Set-Cookie",COOKIE+"=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict"); }
function clientKey(req) {
  const forwarded=req.headers["x-vercel-forwarded-for"]||req.headers["x-forwarded-for"]||"unknown";
  const ip=String(forwarded).split(",")[0].trim().slice(0,100);
  return createHash("sha256").update(ip).digest("hex");
}
function passwordRecord(password) {
  const salt=randomBytes(16).toString("hex");
  const hash=scryptSync(password,salt,64).toString("hex");
  return { salt, hash, N:16384, r:8, p:1 };
}
function passwordMatches(password, record) {
  const candidate=scryptSync(password,record.salt,64);
  const expected=Buffer.from(record.hash,"hex");
  return expected.length===candidate.length && timingSafeEqual(candidate,expected);
}
module.exports={SESSION_TTL,COOKIE,config,redis,json,parseBody,validOrigin,cookieValue,tokenHash,setSessionCookie,clearSessionCookie,clientKey,passwordRecord,passwordMatches};
