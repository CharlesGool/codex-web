#!/usr/bin/env node
import { randomBytes, scryptSync } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const username = process.argv[2] || "admin";
if (!/^[a-zA-Z0-9_.-]{1,64}$/.test(username)) {
  throw new Error("Username must contain 1–64 letters, numbers, _, . or -");
}
const password = randomBytes(24).toString("base64url");
const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");
const file = process.env.CODEX_WEB_AUTH_FILE || path.join(os.homedir(), ".config/codex-web/auth.json");
fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
fs.writeFileSync(file, JSON.stringify({ username, salt, hash }) + "\n", { mode: 0o600 });
fs.chmodSync(file, 0o600);
process.stdout.write(`Username: ${username}\nPassword: ${password}\nCredential file: ${file}\n`);
