import { onRequestPost as register } from "./api/register.js";
import { onRequestPost as login } from "./api/login.js";
import { onRequestPost as logout } from "./api/logout.js";
import { onRequestGet as session } from "./api/session.js";
import { db, ensureSchema, isAuthenticated } from "./api/_lib/auth.js";

const redirect = (url, status = 302) => Response.redirect(url, status);
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/login" || url.pathname === "/login/") {
      const asset = new URL("/login.html", url);
      return env.ASSETS.fetch(new Request(asset, request));
    }
    if (url.pathname === "/api/register" && request.method === "POST") return register({ request, env });
    if (url.pathname === "/api/login" && request.method === "POST") return login({ request, env });
    if (url.pathname === "/api/logout" && request.method === "POST") return logout({ request, env });
    if (url.pathname === "/api/session" && request.method === "GET") return session({ request, env });

    if (url.pathname === "/" || url.pathname === "/index.html") {
      try {
        const sql = db(env);
        await ensureSchema(sql);
        if (!(await isAuthenticated(request, sql))) return redirect(new URL("/login", url).toString());
      } catch {
        return new Response("Authentification indisponible : vérifiez le secret DATABASE_URL du Worker.", { status: 503 });
      }
    }
    return env.ASSETS.fetch(request);
  }
};
