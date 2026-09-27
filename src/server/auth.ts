import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { unwatchFile, watchFile } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type { IncomingMessage } from "node:http";
import type { FastifyInstance } from "fastify";
import type { WebSocket } from "ws";
import { isLocalIpv4, normalizePeerIp, readTrustedIps, trustedIpsPath } from "./trusted-ips.js";

const scrypt = promisify(scryptCallback);
const cookieName = "codex_web_session";
const sessionLifetimeMs = 12 * 60 * 60 * 1000;
const failureWindowMs = 15 * 60 * 1000;
const maxFailures = 5;
const versionedWebAsset = /^\/assets\/[^/?]+-[a-f0-9]{8,}\.(?:js|css)(?:\?.*)?$/i;

type Credential = { username: string; salt: string; hash: string };
type Session = { expiresAt: number; sockets: Set<WebSocket>; trustedIp?: string };
type Authorization = { kind: "session"; id: string };

const loginPage = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>登录 · Codex Web</title>
  <style>
    :root{color-scheme:light;font-family:Inter,"Noto Sans SC",system-ui,-apple-system,"Segoe UI",sans-serif;color:#263849;background:#f6f8f9}
    *{box-sizing:border-box}
    body{min-height:100vh;margin:0}
    .site-header{height:76px;display:flex;align-items:center;padding:0 clamp(20px,3vw,48px);background:#fff;border-bottom:1px solid #e2e8eb}
    .brand{display:flex;align-items:center;gap:14px}
    .brand-mark{width:44px;height:44px;display:grid;place-items:center;border-radius:12px;background:#385c7e;color:#fff}
    .brand-mark svg{width:25px;height:25px}
    .brand-name{font-size:19px;font-weight:700;line-height:1.15;letter-spacing:-.02em}
    .brand-subtitle{margin-top:4px;color:#6b7b88;font-size:12px;line-height:1.25}
    .page{min-height:calc(100vh - 76px);display:grid;place-items:center;padding:44px 20px 64px}
    .card{width:min(100%,480px);padding:42px 44px 36px;background:#fff;border:1px solid #e0e7e9;border-radius:18px;box-shadow:0 14px 42px rgba(30,54,74,.045)}
    .lock-mark{width:60px;height:60px;display:grid;place-items:center;border-radius:16px;background:#edf2f6;color:#385c7e}
    .lock-mark svg{width:30px;height:30px}
    .eyebrow{margin:30px 0 13px;color:#385c7e;font-size:12px;font-weight:750;letter-spacing:.16em}
    h1{margin:0;color:#253748;font-size:34px;line-height:1.2;font-weight:650;letter-spacing:-.03em}
    .intro{margin:13px 0 30px;color:#687986;font-size:15px;line-height:1.6}
    label{display:block;margin:0 0 8px;color:#304251;font-size:14px;font-weight:650}
    .field{margin-bottom:20px}
    input{display:block;width:100%;height:48px;padding:0 14px;border:1px solid #d8e1e5;border-radius:10px;background:#fff;color:#263849;font:inherit;font-size:16px;outline:none;transition:border-color .15s,box-shadow .15s}
    input:hover{border-color:#aebfc9}
    input:focus-visible{border-color:#385c7e;box-shadow:0 0 0 3px rgba(56,92,126,.17)}
    button{display:block;width:100%;min-height:48px;border-radius:10px;font:inherit;font-size:15px;font-weight:650;cursor:pointer;transition:background-color .15s,border-color .15s}
    button:focus-visible{outline:3px solid rgba(56,92,126,.36);outline-offset:2px}
    button:disabled{cursor:wait;opacity:.65}
    .primary{margin-top:27px;border:1px solid #385c7e;background:#385c7e;color:#fff}
    .primary:hover:not(:disabled){background:#2d4f70}
    .secondary{margin-top:12px;border:1px solid #d8e1e5;background:#fff;color:#304251}
    .secondary:hover:not(:disabled){background:#f5f8fa;border-color:#b7c6ce}
    #error{min-height:0;margin-top:16px;color:#ab3434;font-size:14px;line-height:1.5}
    #error:empty{display:none}
    @media(max-width:540px){.site-header{height:68px}.page{min-height:calc(100vh - 68px);padding:28px 16px 44px}.card{padding:30px 24px;border-radius:16px}h1{font-size:30px}.eyebrow{margin-top:24px}}
    @media(prefers-reduced-motion:reduce){input,button{transition:none}}
  </style>
</head>
<body>
  <header class="site-header">
    <div class="brand">
      <div class="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="24" height="20" rx="5"/><path d="m11 13-3 3 3 3m7 0h6"/></svg></div>
      <div><div class="brand-name">Codex Web</div><div class="brand-subtitle">浏览器工作台</div></div>
    </div>
  </header>
  <main class="page">
    <section class="card" aria-labelledby="login-title">
      <div class="lock-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="14" width="18" height="14" rx="3"/><path d="M11 14V9a5 5 0 0 1 10 0v5"/><circle cx="16" cy="21" r="1"/></svg></div>
      <p class="eyebrow">CODEX WEB</p>
      <h1 id="login-title">登录</h1>
      <p class="intro">输入此服务器的账号和密码，继续使用 Codex Web。</p>
      <form id="form">
        <div class="field"><label for="username">账号</label><input id="username" name="username" autocomplete="username" required autofocus></div>
        <div class="field"><label for="password">密码</label><input id="password" name="password" type="password" autocomplete="current-password" required></div>
        <button class="primary" id="login-button" type="submit">登录</button>
      </form>
      <button class="secondary" id="ip-button" type="button">使用可信 IP 访问</button>
      <div id="error" role="alert" aria-live="polite"></div>
    </section>
  </main>
  <script>
    const form=document.getElementById('form');
    const loginButton=document.getElementById('login-button');
    const ipButton=document.getElementById('ip-button');
    const error=document.getElementById('error');
    function setBusy(busy){loginButton.disabled=busy;ipButton.disabled=busy}
    form.addEventListener('submit',async event=>{
      event.preventDefault();setBusy(true);loginButton.textContent='登录中…';error.textContent='';
      try{
        const response=await fetch('/__auth/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({username:document.getElementById('username').value,password:document.getElementById('password').value})});
        if(response.ok){location.replace('/');return}
        error.textContent=response.status===429?'尝试次数过多，请稍后再试':'账号或密码错误';
      }catch{error.textContent='无法连接服务器'}finally{setBusy(false);loginButton.textContent='登录'}
    });
    ipButton.addEventListener('click',async()=>{
      setBusy(true);ipButton.textContent='检查中…';error.textContent='';
      try{
        const response=await fetch('/__auth/ip-access',{method:'POST',credentials:'same-origin',cache:'no-store'});
        if(response.ok){location.replace('/');return}
        error.textContent='此设备未加入可信 IP 列表，请使用账号和密码登录。';
      }catch{error.textContent='无法连接服务器'}finally{setBusy(false);ipButton.textContent='使用可信 IP 访问'}
    });
  </script>
</body>
</html>`;

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
  let trustedIps = readTrustedIps();

  function trustedPeer(address: string | undefined): string | null {
    const ip = normalizePeerIp(address);
    return ip && trustedIps.has(ip) ? ip : null;
  }

  const reloadTrustedIps = () => {
    try {
      trustedIps = readTrustedIps();
    } catch (error) {
      // A malformed or unreadable list must never leave old exemptions active.
      trustedIps = new Set();
      console.error("Codex Web trusted IP list rejected:", error);
    }
    for (const [id, session] of sessions) {
      if (!session.trustedIp || trustedIps.has(session.trustedIp)) continue;
      for (const socket of session.sockets) socket.close(1008, "IP no longer trusted");
      sessions.delete(id);
    }
  };
  watchFile(trustedIpsPath, { interval: 1000, persistent: false }, reloadTrustedIps);
  app.addHook("onClose", async () => unwatchFile(trustedIpsPath, reloadTrustedIps));

  function validSession(header: string | undefined): string | null {
    const id = cookieValue(header);
    if (!id) return null;
    const session = sessions.get(id);
    if (!session) return null;
    if (session.trustedIp && !trustedIps.has(session.trustedIp)) {
      for (const socket of session.sockets) socket.close(1008, "IP no longer trusted");
      sessions.delete(id);
      return null;
    }
    if (session.expiresAt <= Date.now()) {
      for (const socket of session.sockets) socket.close(1008, "Session expired");
      sessions.delete(id);
      return null;
    }
    return id;
  }

  function issueSession(request: { raw: IncomingMessage }, reply: { header(name: string, value: string): unknown }, trustedIp?: string): void {
    const id = randomBytes(32).toString("hex");
    sessions.set(id, { expiresAt: Date.now() + sessionLifetimeMs, sockets: new Set(), trustedIp });
    setTimeout(() => {
      const session = sessions.get(id);
      if (!session) return;
      for (const socket of session.sockets) socket.close(1008, "Session expired");
      sessions.delete(id);
    }, sessionLifetimeMs).unref();
    const secure = (request.raw.socket as typeof request.raw.socket & { encrypted?: boolean }).encrypted ? "; Secure" : "";
    reply.header("Set-Cookie", `${cookieName}=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionLifetimeMs / 1000}${secure}`);
  }

  app.addHook("onRequest", async (request, reply) => {
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("Referrer-Policy", "no-referrer");
    reply.header("Cache-Control", "no-store");
    if (((request.method === "GET" || request.method === "HEAD") && request.url === "/login") ||
        (request.method === "POST" && (request.url === "/__auth/login" || request.url === "/__auth/ip-access"))) return;
    if (validSession(request.headers.cookie)) {
      if ((request.method === "GET" || request.method === "HEAD") && versionedWebAsset.test(request.url)) {
        // Patched bundles keep their upstream filenames, so use a short lifetime.
        reply.header("Cache-Control", "private, max-age=300");
        reply.header("Vary", "Accept-Encoding");
      }
      return;
    }
    if (request.method === "GET" && request.headers.accept?.includes("text/html")) {
      return reply.redirect("/login");
    }
    return reply.code(401).send({ error: "Authentication required" });
  });

  app.get("/login", async (_request, reply) => {
    reply.header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'");
    return reply.type("text/html; charset=utf-8").send(loginPage);
  });

  app.get("/__auth/trusted-ips", async (request) => ({
    ips: [...trustedIps].sort(),
    currentIp: normalizePeerIp(request.raw.socket.remoteAddress),
  }));

  app.put("/__auth/trusted-ips", { bodyLimit: 8192 }, async (request, reply) => {
    if (!sameOrigin(request.raw)) return reply.code(403).send({ error: "Invalid origin" });
    const body = request.body as { ips?: unknown } | null;
    const ips = body?.ips;
    if (request.headers["content-type"]?.split(";")[0] !== "application/json" ||
        !Array.isArray(ips) || ips.length > 128 ||
        !ips.every((ip) => typeof ip === "string" && isLocalIpv4(ip)) ||
        new Set(ips).size !== ips.length) {
      return reply.code(400).send({ error: "Use up to 128 unique private or loopback IPv4 addresses" });
    }
    await fs.mkdir(path.dirname(trustedIpsPath), { recursive: true, mode: 0o700 });
    const temporaryPath = `${trustedIpsPath}.${randomBytes(8).toString("hex")}.tmp`;
    try {
      await fs.writeFile(temporaryPath, `${JSON.stringify({ ips: [...ips].sort() }, null, 2)}\n`, { mode: 0o600, flag: "wx" });
      await fs.rename(temporaryPath, trustedIpsPath);
      await fs.chmod(trustedIpsPath, 0o600);
    } finally {
      await fs.unlink(temporaryPath).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
      });
    }
    reloadTrustedIps();
    return reply.send({ ips: [...trustedIps].sort(), currentIp: normalizePeerIp(request.raw.socket.remoteAddress) });
  });

  app.post("/__auth/ip-access", async (request, reply) => {
    if (!sameOrigin(request.raw)) return reply.code(403).send({ ok: false });
    const ip = trustedPeer(request.raw.socket.remoteAddress);
    if (!ip) return reply.code(403).send({ ok: false });
    issueSession(request, reply, ip);
    return reply.send({ ok: true });
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
    issueSession(request, reply);
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
    authorizeUpgrade(request: IncomingMessage): Authorization | null {
      if (!sameOrigin(request)) return null;
      const id = validSession(request.headers.cookie);
      return id ? { kind: "session", id } : null;
    },
    registerSocket(authorization: Authorization, socket: WebSocket): void {
      const { id } = authorization;
      sessions.get(id)?.sockets.add(socket);
      socket.on("close", () => sessions.get(id)?.sockets.delete(socket));
      socket.on("message", () => {
        if (!sessions.has(id) || !validSession(`${cookieName}=${id}`)) socket.close(1008, "Session expired");
      });
    },
  };
}
