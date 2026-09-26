#!/usr/bin/env node
import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { isLocalIpv4, readTrustedIps, trustedIpsPath } = require("../src/server/trusted-ips.js");
const [command, ...addresses] = process.argv.slice(2);

if (!command || !["list", "add", "remove"].includes(command) ||
    (command === "list" && addresses.length !== 0) ||
    (command !== "list" && addresses.length === 0)) {
  console.error("Usage: node scripts/manage-trusted-ips.mjs list|add|remove [PRIVATE_IPV4 ...]");
  process.exit(2);
}

if (command !== "list" && !addresses.every(isLocalIpv4)) {
  console.error("Only private or loopback IPv4 addresses are accepted.");
  process.exit(2);
}

const ips = readTrustedIps();
if (command === "add") for (const ip of addresses) ips.add(ip);
if (command === "remove") for (const ip of addresses) ips.delete(ip);

if (command !== "list") {
  await fs.mkdir(path.dirname(trustedIpsPath), { recursive: true, mode: 0o700 });
  const temporaryPath = `${trustedIpsPath}.${randomBytes(8).toString("hex")}.tmp`;
  try {
    await fs.writeFile(temporaryPath, `${JSON.stringify({ ips: [...ips].sort() }, null, 2)}\n`, { mode: 0o600, flag: "wx" });
    await fs.rename(temporaryPath, trustedIpsPath);
    await fs.chmod(trustedIpsPath, 0o600);
  } finally {
    await fs.unlink(temporaryPath).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
  }
}

console.log(ips.size ? [...ips].sort().join("\n") : "(empty)");
