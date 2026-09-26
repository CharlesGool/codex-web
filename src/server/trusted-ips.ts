import { readFileSync } from "node:fs";
import { isIP } from "node:net";
import os from "node:os";
import path from "node:path";

export const trustedIpsPath = process.env.CODEX_WEB_TRUSTED_IPS_FILE ||
  path.join(os.homedir(), ".config/codex-web/trusted-ips.json");

// Use only the TCP peer. Forwarded headers are supplied by the client unless a
// trusted reverse proxy is configured, so they cannot grant authentication.
export function normalizePeerIp(address: string | undefined): string | null {
  if (!address) return null;
  const ipv4 = address.startsWith("::ffff:") ? address.slice(7) : address;
  return isIP(ipv4) === 4 ? ipv4 : null;
}

export function isLocalIpv4(address: string): boolean {
  if (isIP(address) !== 4) return false;
  const parts = address.split(".").map(Number);
  return parts[0] === 10 || parts[0] === 127 ||
    (parts[0] === 172 && parts[1]! >= 16 && parts[1]! <= 31) ||
    (parts[0] === 192 && parts[1] === 168);
}

export function readTrustedIps(file = trustedIpsPath): Set<string> {
  let content: string;
  try {
    content = readFileSync(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return new Set();
    throw error;
  }
  const config: unknown = JSON.parse(content);
  if (!config || typeof config !== "object" || !Array.isArray((config as { ips?: unknown }).ips)) {
    throw new Error(`Invalid trusted IP list: ${file}`);
  }
  const addresses = (config as { ips: unknown[] }).ips;
  if (!addresses.every((address) => typeof address === "string" && isLocalIpv4(address))) {
    throw new Error(`Trusted IP list must contain only private or loopback IPv4 addresses: ${file}`);
  }
  return new Set(addresses as string[]);
}
