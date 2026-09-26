import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type { IncomingMessage } from "node:http";
import type { FastifyInstance } from "fastify";
import type { WebSocket } from "ws";

const scrypt = promisify(scryptCallback);
const cookieName = "codex_web_session";
const sessionLifetimeMs = 12 * 60 * 60 * 1000;
const failureWindowMs = 15 * 60 * 1000;
const maxFailures = 5;

type Credential = { username: string; salt: string; hash: string };
type Session = { expiresAt: number; sockets: Set<WebSocket> };

const loginPage = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>登录 Codex Web</title><style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f7f5;color:#222;font:16px system-ui,sans-serif}main{width:min(380px,calc(100vw - 32px));background:#fff;padding:32px;border:1px solid #ddd;border-radius:16px;box-shadow:0 12px 40px #0001}h1{font-size:24px;margin:0 0 24px}label{display:block;margin:16px 0 6px}input{width:100%;font:inherit;padding:11px;border:1px solid #aaa;border-radius:8px}button{width:100%;font:inherit;margin-top:24px;padding:12px;color:#fff;background:#1769d1;border:0;border-radius:8px;cursor:pointer}button:disabled{opacity:.6}#error{min-height:24px;color:#b42318;margin-top:12px}
</style></head><body><main><h1>登录 Codex Web</h1><form id="form"><label for="username">账号</label><input id="username" name="username" autocomplete="username" required autofocus><label for="password">密码</label><input id="password" name="password" type="password" autocomplete="current-password" required><button type="submit">登录</button><div id="error" role="alert"></div></form></main><script>
document.getElementById('form').addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget,button=form.querySelector('button'),error=document.getElementById('error');button.disabled=true;error.textContent='';try{const response=await fetch('/__auth/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({username:document.getElementById('username').value,password:document.getElementById('password').value})});if(response.ok){location.replace('/');return}error.textContent=response.status===429?'尝试次数过多，请稍后再试':'账号或密码错误'}catch{error.textContent='无法连接服务器'}finally{button.disabled=false}});
</script></body></html>`;

function cookieValue(header: string | undefined): string | null {
  const value = header?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`));
  return value ? value.slice(cookieName.length + 1) : null;
}

function sameOrigin(request: IncomingMessage): boolean {
  const origin = request.headers.origin;
  const host = request.headers.host;
  return typeof origin === "string" && typeof host === "string" &&
    (origin === `http://${host}` || origin === `https://${host}`);
}

export async function installAuthentication(app: FastifyInstance) {
  const credentialPath = process.env.CODEX_WEB_AUTH_FILE || path.join(os.homedir(), ".config/codex-web/auth.json");
  const credential = JSON.parse(await fs.readFile(credentialPath, "utf8")) as Credential;
  if (!credential.username || !/^[a-f0-9]{32}$/.test(credential.salt) || !/^[a-f0-9]{128}$/.test(credential.hash)) {
    throw new Error(`Invalid Codex Web credential file: ${credentialPath}`);
  }
  const expectedHash = Buffer.from(credential.hash, "hex");
  const sessions = new Map<string, Session>();
  const failures = new Map<string, { count: number; resetAt: number }>();

  function validSession(header: string | undefined): string | null {
    const id = cookieValue(header);
    if (!id) return null;
    const session = sessions.get(id);
    if (!session) return null;
    if (session.expiresAt <= Date.now()) {
      for (const socket of session.sockets) socket.close(1008, "Session expired");
      sessions.delete(id);
      return null;
    }
    return id;
  }

  app.addHook("onRequest", async (request, reply) => {
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("Referrer-Policy", "no-referrer");
    reply.header("Cache-Control", "no-store");
    if (request.url === "/login" || request.url === "/__auth/login") return;
    if (validSession(request.headers.cookie)) return;
    if (request.method === "GET" && request.headers.accept?.includes("text/html")) {
      return reply.redirect("/login");
    }
    return reply.code(401).send({ error: "Authentication required" });
  });

  app.get("/login", async (request, reply) => {
    if (validSession(request.headers.cookie)) return reply.redirect("/");
    reply.header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'");
    return reply.type("text/html; charset=utf-8").send(loginPage);
  });

  app.post("/__auth/login", { bodyLimit: 4096 }, async (request, reply) => {
    const key = request.ip;
    const now = Date.now();
    const failure = failures.get(key);
    if (failure && failure.resetAt > now && failure.count >= maxFailures) {
      return reply.code(429).send({ error: "Too many login attempts" });
    }
    const body = request.body as { username?: unknown; password?: unknown } | null;
    if (request.headers["content-type"]?.split(";")[0] !== "application/json" ||
        typeof body?.username !== "string" || typeof body.password !== "string" ||
        body.username.length > 128 || body.password.length > 1024) {
      return reply.code(400).send({ error: "Invalid login request" });
    }
    const actualHash = await scrypt(body.password, credential.salt, expectedHash.length) as Buffer;
    if (body.username !== credential.username || !timingSafeEqual(actualHash, expectedHash)) {
      failures.set(key, { count: failure && failure.resetAt > now ? failure.count + 1 : 1, resetAt: failure && failure.resetAt > now ? failure.resetAt : now + failureWindowMs });
      return reply.code(401).send({ error: "Invalid credentials" });
    }
    failures.delete(key);
    const id = randomBytes(32).toString("hex");
    sessions.set(id, { expiresAt: now + sessionLifetimeMs, sockets: new Set() });
    setTimeout(() => {
      const session = sessions.get(id);
      if (!session) return;
      for (const socket of session.sockets) socket.close(1008, "Session expired");
      sessions.delete(id);
    }, sessionLifetimeMs).unref();
    const secure = (request.raw.socket as typeof request.raw.socket & { encrypted?: boolean }).encrypted ? "; Secure" : "";
    reply.header("Set-Cookie", `${cookieName}=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionLifetimeMs / 1000}${secure}`);
    return reply.send({ ok: true });
  });

  app.post("/__auth/logout", async (request, reply) => {
    const id = validSession(request.headers.cookie);
    if (id) {
      for (const socket of sessions.get(id)?.sockets ?? []) socket.close(1008, "Logged out");
      sessions.delete(id);
    }
    reply.header("Set-Cookie", `${cookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`);
    return reply.send({ ok: true });
  });

  return {
    authorizeUpgrade(request: IncomingMessage): string | null {
      if (!sameOrigin(request)) return null;
      return validSession(request.headers.cookie);
    },
    registerSocket(id: string, socket: WebSocket): void {
      sessions.get(id)?.sockets.add(socket);
      socket.on("close", () => sessions.get(id)?.sockets.delete(socket));
      socket.on("message", () => {
        if (!sessions.has(id) || !validSession(`${cookieName}=${id}`)) socket.close(1008, "Session expired");
      });
    },
  };
}
