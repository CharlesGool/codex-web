"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trustedIpsPath = void 0;
exports.normalizePeerIp = normalizePeerIp;
exports.isLocalIpv4 = isLocalIpv4;
exports.readTrustedIps = readTrustedIps;
const node_fs_1 = require("node:fs");
const node_net_1 = require("node:net");
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
exports.trustedIpsPath = process.env.CODEX_WEB_TRUSTED_IPS_FILE ||
    node_path_1.default.join(node_os_1.default.homedir(), ".config/codex-web/trusted-ips.json");
// Use only the TCP peer. Forwarded headers are supplied by the client unless a
// trusted reverse proxy is configured, so they cannot grant authentication.
function normalizePeerIp(address) {
    if (!address)
        return null;
    const ipv4 = address.startsWith("::ffff:") ? address.slice(7) : address;
    return (0, node_net_1.isIP)(ipv4) === 4 ? ipv4 : null;
}
function isLocalIpv4(address) {
    if ((0, node_net_1.isIP)(address) !== 4)
        return false;
    const parts = address.split(".").map(Number);
    return parts[0] === 10 || parts[0] === 127 ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168);
}
function readTrustedIps(file = exports.trustedIpsPath) {
    let content;
    try {
        content = (0, node_fs_1.readFileSync)(file, "utf8");
    }
    catch (error) {
        if (error.code === "ENOENT")
            return new Set();
        throw error;
    }
    const config = JSON.parse(content);
    if (!config || typeof config !== "object" || !Array.isArray(config.ips)) {
        throw new Error(`Invalid trusted IP list: ${file}`);
    }
    const addresses = config.ips;
    if (!addresses.every((address) => typeof address === "string" && isLocalIpv4(address))) {
        throw new Error(`Trusted IP list must contain only private or loopback IPv4 addresses: ${file}`);
    }
    return new Set(addresses);
}
//# sourceMappingURL=trusted-ips.js.map