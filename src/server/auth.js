"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installAuthentication = installAuthentication;
const node_crypto_1 = require("node:crypto");
const node_fs_1 = require("node:fs");
const promises_1 = __importDefault(require("node:fs/promises"));
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const node_util_1 = require("node:util");
const trusted_ips_js_1 = require("./trusted-ips.js");
const scrypt = (0, node_util_1.promisify)(node_crypto_1.scrypt);
const cookieName = "codex_web_session";
const sessionLifetimeMs = 12 * 60 * 60 * 1000;
const failureWindowMs = 15 * 60 * 1000;
const maxFailures = 5;
const versionedWebAsset = /^\/assets\/[^/?]+-[a-f0-9]{8,}\.(?:js|css)(?:\?.*)?$/i;
const loginPage = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>登录 Codex Web</title><style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f7f5;color:#222;font:16px system-ui,sans-serif}main{width:min(380px,calc(100vw - 32px));background:#fff;padding:32px;border:1px solid #ddd;border-radius:16px;box-shadow:0 12px 40px #0001}h1{font-size:24px;margin:0 0 24px}label{display:block;margin:16px 0 6px}input{width:100%;font:inherit;padding:11px;border:1px solid #aaa;border-radius:8px}button{width:100%;font:inherit;margin-top:24px;padding:12px;color:#fff;background:#1769d1;border:0;border-radius:8px;cursor:pointer}button:disabled{opacity:.6}#error{min-height:24px;color:#b42318;margin-top:12px}
</style></head><body><main><h1>登录 Codex Web</h1><form id="form"><label for="username">账号</label><input id="username" name="username" autocomplete="username" required autofocus><label for="password">密码</label><input id="password" name="password" type="password" autocomplete="current-password" required><button type="submit">登录</button><div id="error" role="alert"></div></form></main><script>
document.getElementById('form').addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget,button=form.querySelector('button'),error=document.getElementById('error');button.disabled=true;error.textContent='';try{const response=await fetch('/__auth/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({username:document.getElementById('username').value,password:document.getElementById('password').value})});if(response.ok){location.replace('/');return}error.textContent=response.status===429?'尝试次数过多，请稍后再试':'账号或密码错误'}catch{error.textContent='无法连接服务器'}finally{button.disabled=false}});
</script></body></html>`;
function cookieValue(header) {
    const value = header?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`));
    return value ? value.slice(cookieName.length + 1) : null;
}
function sameOrigin(request) {
    const origin = request.headers.origin;
    const host = request.headers.host;
    return typeof origin === "string" && typeof host === "string" &&
        (origin === `http://${host}` || origin === `https://${host}`);
}
async function installAuthentication(app) {
    const credentialPath = process.env.CODEX_WEB_AUTH_FILE || node_path_1.default.join(node_os_1.default.homedir(), ".config/codex-web/auth.json");
    const credential = JSON.parse(await promises_1.default.readFile(credentialPath, "utf8"));
    if (!credential.username || !/^[a-f0-9]{32}$/.test(credential.salt) || !/^[a-f0-9]{128}$/.test(credential.hash)) {
        throw new Error(`Invalid Codex Web credential file: ${credentialPath}`);
    }
    const expectedHash = Buffer.from(credential.hash, "hex");
    const sessions = new Map();
    const failures = new Map();
    const trustedSockets = new Map();
    let trustedIps = (0, trusted_ips_js_1.readTrustedIps)();
    function trustedPeer(address) {
        const ip = (0, trusted_ips_js_1.normalizePeerIp)(address);
        return ip && trustedIps.has(ip) ? ip : null;
    }
    const reloadTrustedIps = () => {
        try {
            trustedIps = (0, trusted_ips_js_1.readTrustedIps)();
        }
        catch (error) {
            // A malformed or unreadable list must never leave old exemptions active.
            trustedIps = new Set();
            console.error("Codex Web trusted IP list rejected:", error);
        }
        for (const [ip, sockets] of trustedSockets) {
            if (trustedIps.has(ip))
                continue;
            for (const socket of sockets)
                socket.close(1008, "IP no longer trusted");
            trustedSockets.delete(ip);
        }
    };
    (0, node_fs_1.watchFile)(trusted_ips_js_1.trustedIpsPath, { interval: 1000, persistent: false }, reloadTrustedIps);
    app.addHook("onClose", async () => (0, node_fs_1.unwatchFile)(trusted_ips_js_1.trustedIpsPath, reloadTrustedIps));
    function validSession(header) {
        const id = cookieValue(header);
        if (!id)
            return null;
        const session = sessions.get(id);
        if (!session)
            return null;
        if (session.expiresAt <= Date.now()) {
            for (const socket of session.sockets)
                socket.close(1008, "Session expired");
            sessions.delete(id);
            return null;
        }
        return id;
    }
    app.addHook("onRequest", async (request, reply) => {
        reply.header("X-Content-Type-Options", "nosniff");
        reply.header("Referrer-Policy", "no-referrer");
        reply.header("Cache-Control", "no-store");
        if (request.url === "/login" || request.url === "/__auth/login")
            return;
        if (validSession(request.headers.cookie) || trustedPeer(request.raw.socket.remoteAddress)) {
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
    app.get("/login", async (request, reply) => {
        if (validSession(request.headers.cookie) || trustedPeer(request.raw.socket.remoteAddress))
            return reply.redirect("/");
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
        const body = request.body;
        if (request.headers["content-type"]?.split(";")[0] !== "application/json" ||
            typeof body?.username !== "string" || typeof body.password !== "string" ||
            body.username.length > 128 || body.password.length > 1024) {
            return reply.code(400).send({ error: "Invalid login request" });
        }
        const actualHash = await scrypt(body.password, credential.salt, expectedHash.length);
        if (body.username !== credential.username || !(0, node_crypto_1.timingSafeEqual)(actualHash, expectedHash)) {
            failures.set(key, { count: failure && failure.resetAt > now ? failure.count + 1 : 1, resetAt: failure && failure.resetAt > now ? failure.resetAt : now + failureWindowMs });
            return reply.code(401).send({ error: "Invalid credentials" });
        }
        failures.delete(key);
        const id = (0, node_crypto_1.randomBytes)(32).toString("hex");
        sessions.set(id, { expiresAt: now + sessionLifetimeMs, sockets: new Set() });
        setTimeout(() => {
            const session = sessions.get(id);
            if (!session)
                return;
            for (const socket of session.sockets)
                socket.close(1008, "Session expired");
            sessions.delete(id);
        }, sessionLifetimeMs).unref();
        const secure = request.raw.socket.encrypted ? "; Secure" : "";
        reply.header("Set-Cookie", `${cookieName}=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionLifetimeMs / 1000}${secure}`);
        return reply.send({ ok: true });
    });
    app.post("/__auth/logout", async (request, reply) => {
        const id = validSession(request.headers.cookie);
        if (id) {
            for (const socket of sessions.get(id)?.sockets ?? [])
                socket.close(1008, "Logged out");
            sessions.delete(id);
        }
        reply.header("Set-Cookie", `${cookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`);
        return reply.send({ ok: true });
    });
    return {
        authorizeUpgrade(request) {
            if (!sameOrigin(request))
                return null;
            const id = validSession(request.headers.cookie);
            if (id)
                return { kind: "session", id };
            const ip = trustedPeer(request.socket.remoteAddress);
            return ip ? { kind: "trusted-ip", ip } : null;
        },
        registerSocket(authorization, socket) {
            if (authorization.kind === "trusted-ip") {
                const { ip } = authorization;
                if (!trustedIps.has(ip)) {
                    socket.close(1008, "IP no longer trusted");
                    return;
                }
                const sockets = trustedSockets.get(ip) ?? new Set();
                sockets.add(socket);
                trustedSockets.set(ip, sockets);
                socket.on("close", () => {
                    sockets.delete(socket);
                    if (sockets.size === 0)
                        trustedSockets.delete(ip);
                });
                return;
            }
            const { id } = authorization;
            sessions.get(id)?.sockets.add(socket);
            socket.on("close", () => sessions.get(id)?.sockets.delete(socket));
            socket.on("message", () => {
                if (!sessions.has(id) || !validSession(`${cookieName}=${id}`))
                    socket.close(1008, "Session expired");
            });
        },
    };
}
//# sourceMappingURL=auth.js.map