import assert from "node:assert/strict";
import { randomBytes, scryptSync } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import Fastify from "fastify";
import { WebSocket, WebSocketServer } from "ws";

const require = createRequire(import.meta.url);
const temporaryDir = await fs.mkdtemp(path.join(os.tmpdir(), "codex-web-auth-test-"));
process.env.CODEX_WEB_AUTH_FILE = path.join(temporaryDir, "auth.json");
process.env.CODEX_WEB_TRUSTED_IPS_FILE = path.join(temporaryDir, "trusted-ips.json");
const salt = randomBytes(16).toString("hex");
await fs.writeFile(process.env.CODEX_WEB_AUTH_FILE, JSON.stringify({
  username: "test",
  salt,
  hash: scryptSync("password", salt, 64).toString("hex"),
}));
await fs.writeFile(process.env.CODEX_WEB_TRUSTED_IPS_FILE, JSON.stringify({ ips: ["127.0.0.1"] }));

const { installAuthentication } = require("../src/server/auth.js");
const app = Fastify();
const websocketServer = new WebSocketServer({ noServer: true });
let trustedSocket;

try {
  const auth = await installAuthentication(app);
  app.get("/", async () => ({ ok: true }));
  app.server.on("upgrade", (request, socket, head) => {
    const authorization = auth.authorizeUpgrade(request);
    if (!authorization) {
      socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
      socket.destroy();
      return;
    }
    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
      auth.registerSocket(authorization, websocket);
      websocketServer.emit("connection", websocket, request);
    });
  });
  await app.listen({ host: "0.0.0.0", port: 0 });
  const port = app.server.address().port;
  const networkIp = Object.values(os.networkInterfaces()).flat()
    .find((address) => address?.family === "IPv4" && !address.internal)?.address;
  assert.ok(networkIp, "a non-loopback IPv4 address is required for this test");

  const trustedUrl = `http://127.0.0.1:${port}`;
  const untrustedUrl = `http://${networkIp}:${port}`;
  assert.equal((await fetch(trustedUrl)).status, 200);
  assert.equal((await fetch(`${trustedUrl}/login`, { redirect: "manual" })).status, 302);
  assert.equal((await fetch(untrustedUrl, { headers: { Accept: "application/json" } })).status, 401);
  assert.equal((await fetch(untrustedUrl, {
    headers: { Accept: "application/json", "X-Forwarded-For": "127.0.0.1" },
  })).status, 401);
  assert.equal((await fetch(`${untrustedUrl}/login`, { redirect: "manual" })).status, 200);

  trustedSocket = new WebSocket(`ws://127.0.0.1:${port}`, {
    origin: trustedUrl,
  });
  await new Promise((resolve, reject) => {
    trustedSocket.once("open", resolve);
    trustedSocket.once("error", reject);
  });
  assert.equal(trustedSocket.readyState, WebSocket.OPEN);

  await assert.rejects(new Promise((resolve, reject) => {
    const socket = new WebSocket(`ws://${networkIp}:${port}`, {
      origin: untrustedUrl,
      headers: { "X-Forwarded-For": "127.0.0.1" },
    });
    socket.once("open", resolve);
    socket.once("error", reject);
  }), /401/);

  const revoked = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("trusted connection was not revoked")), 3000);
    trustedSocket.once("close", () => {
      clearTimeout(timer);
      resolve();
    });
  });
  const updated = `${process.env.CODEX_WEB_TRUSTED_IPS_FILE}.new`;
  await fs.writeFile(updated, JSON.stringify({ ips: [] }));
  await fs.rename(updated, process.env.CODEX_WEB_TRUSTED_IPS_FILE);
  await revoked;
  assert.equal((await fetch(trustedUrl, { headers: { Accept: "application/json" } })).status, 401);
  console.log("Trusted IP HTTP, WebSocket, spoofing, and live revocation checks passed.");
} finally {
  trustedSocket?.terminate();
  websocketServer.close();
  await app.close();
  await fs.rm(temporaryDir, { recursive: true, force: true });
}
