#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_child_process_1 = require("node:child_process");
const node_crypto_1 = require("node:crypto");
const promises_1 = __importDefault(require("node:fs/promises"));
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const node_util_1 = require("node:util");
const ws_1 = require("ws");
const fastify_1 = __importDefault(require("fastify"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const static_1 = __importDefault(require("@fastify/static"));
const module_1 = require("./module");
const glob_1 = require("glob");
const auth_1 = require("./auth");
class WebSocketMessagePort {
    portId;
    sendToRenderer;
    onClosed;
    closed = false;
    pendingMessages = [];
    listeners = new Map();
    constructor(portId, sendToRenderer, onClosed) {
        this.portId = portId;
        this.sendToRenderer = sendToRenderer;
        this.onClosed = onClosed;
    }
    on(event, listener) {
        const listeners = this.listeners.get(event) ?? new Set();
        listeners.add(listener);
        this.listeners.set(event, listeners);
        if (event === "message") {
            for (const data of this.pendingMessages.splice(0)) {
                this.receiveMessage(data);
            }
        }
        return this;
    }
    postMessage(data) {
        if (this.closed) {
            return;
        }
        this.sendToRenderer({
            type: "message-port-message",
            portId: this.portId,
            data,
        });
    }
    start() { }
    close() {
        if (!this.markClosed()) {
            return;
        }
        this.sendToRenderer({
            type: "message-port-close",
            portId: this.portId,
        });
    }
    receiveMessage(data) {
        if (this.closed) {
            return;
        }
        const listeners = this.listeners.get("message");
        if (!listeners || listeners.size === 0) {
            this.pendingMessages.push(data);
            return;
        }
        for (const listener of listeners) {
            listener({ data });
        }
    }
    disconnect() {
        if (!this.markClosed()) {
            return;
        }
        this.emit("close");
    }
    emit(event, ...args) {
        for (const listener of this.listeners.get(event) ?? []) {
            listener(...args);
        }
    }
    markClosed() {
        if (this.closed) {
            return false;
        }
        this.closed = true;
        this.pendingMessages.length = 0;
        this.onClosed();
        return true;
    }
}
function workspaceDirectoryEntryTypeRank(entry) {
    return entry.type === "directory" ? 0 : 1;
}
function workspaceDirectoryEntryHiddenRank(entry) {
    return entry.name.startsWith(".") ? 1 : 0;
}
function compareWorkspaceDirectoryEntries(left, right) {
    return (workspaceDirectoryEntryTypeRank(left) -
        workspaceDirectoryEntryTypeRank(right) ||
        workspaceDirectoryEntryHiddenRank(left) -
            workspaceDirectoryEntryHiddenRank(right) ||
        left.name.localeCompare(right.name));
}
function printUsage() {
    console.log([
        "Usage:",
        "  server [--host <host>] [--port <port>]",
        "",
        "Defaults:",
        "  --host 127.0.0.1",
        "  --port 8214",
        "",
        "Examples:",
        "  yarn server",
        "  yarn server --port 9000",
    ].join("\n"));
}
function parsePort(raw) {
    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
        throw new Error(`Invalid port: ${raw}`);
    }
    return parsed;
}
function parseServerArgs(args) {
    const parsed = (0, node_util_1.parseArgs)({
        args,
        allowPositionals: false,
        options: {
            help: {
                short: "h",
                type: "boolean",
            },
            host: {
                type: "string",
            },
            port: {
                type: "string",
            },
        },
        strict: true,
    });
    if (parsed.values.help) {
        printUsage();
        process.exit(0);
    }
    return {
        host: parsed.values.host ?? "127.0.0.1",
        port: parsed.values.port ? parsePort(parsed.values.port) : 8214,
    };
}
function getIpcMainBridgeState() {
    const globals = globalThis;
    if (!globals.__codexElectronIpcBridge) {
        globals.__codexElectronIpcBridge = {};
    }
    return globals.__codexElectronIpcBridge;
}
function errorMessage(error) {
    if (error instanceof Error) {
        return error.stack ?? error.message;
    }
    return String(error);
}
async function getWorkspaceDirectoryEntries({ directoryPath, directoriesOnly, }) {
    const requestedPath = directoryPath?.trim() || node_os_1.default.homedir();
    const resolvedPath = node_path_1.default.resolve(requestedPath);
    const stat = await promises_1.default.stat(resolvedPath);
    if (!stat.isDirectory()) {
        throw new Error(`Directory not found: ${requestedPath}`);
    }
    const entries = (await promises_1.default.readdir(resolvedPath, { withFileTypes: true }))
        .flatMap((entry) => {
        const type = entry.isDirectory() ? "directory" : "file";
        if (directoriesOnly && type !== "directory") {
            return [];
        }
        return [
            {
                name: entry.name,
                path: node_path_1.default.join(resolvedPath, entry.name),
                type,
            },
        ];
    })
        .sort(compareWorkspaceDirectoryEntries);
    const rootPath = node_path_1.default.parse(resolvedPath).root;
    const parentPath = resolvedPath === rootPath ? null : node_path_1.default.dirname(resolvedPath);
    return {
        directoryPath: resolvedPath,
        parentPath,
        entries,
    };
}
function ensureElectronLikeProcessContext() {
    process.env.BUILD_FLAVOR = "prod";
    const versions = process.versions;
    if (!versions.electron) {
        Object.defineProperty(versions, "electron", {
            value: "41.2.0",
            configurable: true,
            enumerable: true,
            writable: false,
        });
    }
    const processWithElectronFields = process;
    const systemVersion = process.platform === "darwin"
        ? (0, node_child_process_1.execFileSync)("/usr/bin/sw_vers", ["-productVersion"], {
            encoding: "utf8",
        }).trim()
        : node_os_1.default.release();
    processWithElectronFields.getSystemVersion ??= () => systemVersion;
    processWithElectronFields.resourcesPath ??= node_path_1.default.resolve(__dirname, "../../scratch/asar");
    processWithElectronFields.type ??= "browser";
}
async function startIpcBridgeServer(options) {
    const bridgeState = getIpcMainBridgeState();
    const app = (0, fastify_1.default)({ logger: false });
    const websocketServer = new ws_1.WebSocketServer({ noServer: true });
    const auth = await (0, auth_1.installAuthentication)(app);
    await app.register(multipart_1.default, {
        limits: {
            fileSize: Infinity,
        },
    });
    const uploadRoot = await promises_1.default.mkdtemp(node_path_1.default.join(node_os_1.default.tmpdir(), "codex-web-uploads-"));
    app.post("/__backend/upload", async (request, reply) => {
        if (!request.isMultipart()) {
            return reply.code(400).send({ error: "expected multipart upload body" });
        }
        const files = await Array.fromAsync((async function* () {
            for await (const part of request.files()) {
                const label = part.filename?.trim() || "upload";
                const uploadedPath = node_path_1.default.join(uploadRoot, (0, node_crypto_1.randomUUID)());
                await promises_1.default.writeFile(uploadedPath, await part.toBuffer());
                yield {
                    label,
                    path: uploadedPath,
                    fsPath: uploadedPath,
                };
            }
        })());
        return reply.send({ files });
    });
    await app.register(static_1.default, {
        root: "/",
        prefix: "/@fs/",
        decorateReply: false,
        cacheControl: false,
    });
    await app.register(static_1.default, {
        root: node_path_1.default.resolve(__dirname, "../../scratch/asar/webview"),
        prefix: "/",
        cacheControl: false,
        preCompressed: true,
    });
    app.get("/", async (_request, reply) => {
        return reply.sendFile("index.html");
    });
    app.setNotFoundHandler((request, reply) => {
        if (request.url.startsWith("/@fs/")) {
            return reply.code(404).send({ error: "Not Found" });
        }
        if (request.method === "GET") {
            return reply.sendFile("index.html");
        }
        return reply.code(404).send({ error: "Not Found" });
    });
    app.server.on("upgrade", (request, socket, head) => {
        const requestUrl = request.url ?? "/";
        const host = request.headers.host ?? "localhost";
        const url = new URL(requestUrl, `http://${host}`);
        if (url.pathname !== "/__backend/ipc") {
            socket.destroy();
            return;
        }
        const authorization = auth.authorizeUpgrade(request);
        if (!authorization) {
            socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
            socket.destroy();
            return;
        }
        websocketServer.handleUpgrade(request, socket, head, (upgradedSocket) => {
            auth.registerSocket(authorization, upgradedSocket);
            websocketServer.emit("connection", upgradedSocket, request);
        });
    });
    const rendererSockets = new Map();
    const rendererWindowFactory = new Promise((resolve) => {
        bridgeState.setRendererWindowFactory = resolve;
    });
    bridgeState.sendToRenderer = (webContentsId, message) => {
        const socket = rendererSockets.get(webContentsId);
        if (socket?.readyState === ws_1.WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
    };
    websocketServer.on("connection", (socket) => {
        let rendererWindow;
        // Each tab is a real registered app view, with its own IPC client and ownership.
        const rendererReady = rendererWindowFactory
            .then(async (createWindow) => {
            if (socket.readyState !== ws_1.WebSocket.OPEN)
                return undefined;
            const window = await createWindow();
            if (socket.readyState !== ws_1.WebSocket.OPEN) {
                window.destroy();
                return undefined;
            }
            rendererWindow = window;
            rendererSockets.set(window.webContents.id, socket);
            return window;
        })
            .catch((error) => {
            console.error("[ipc-bridge] failed to create renderer window", error);
            socket.close(1011, "Renderer initialization failed");
            return undefined;
        });
        const messagePorts = new Map();
        const dispatchPostMessage = (channel, message, ports, windowId) => {
            const handler = bridgeState.handleRendererPostMessage;
            if (handler) {
                handler(channel, message, ports, windowId);
                return;
            }
            console.error(`[ipc-bridge] no ipcMain postMessage handler for channel ${channel}`);
            for (const port of ports) {
                port.close();
            }
        };
        socket.on("close", () => {
            for (const port of messagePorts.values()) {
                port.disconnect();
            }
            messagePorts.clear();
            if (rendererWindow) {
                rendererSockets.delete(rendererWindow.webContents.id);
                rendererWindow.destroy();
            }
        });
        socket.on("message", async (rawData) => {
            const window = await rendererReady;
            if (!window || socket.readyState !== ws_1.WebSocket.OPEN)
                return;
            let message;
            try {
                message = JSON.parse(String(rawData));
            }
            catch (error) {
                console.error("[ipc-bridge] invalid JSON payload", error);
                return;
            }
            if (message.type === "ipc-renderer-send") {
                bridgeState.handleRendererSend?.(message.channel, message.args, window.id);
                return;
            }
            if (message.type === "ipc-renderer-post-message") {
                if (new Set(message.portIds).size !== message.portIds.length) {
                    console.error("[ipc-bridge] duplicate transferred MessagePort id");
                    return;
                }
                const ports = message.portIds.map((portId) => {
                    const existingPort = messagePorts.get(portId);
                    if (existingPort) {
                        existingPort.disconnect();
                    }
                    const port = new WebSocketMessagePort(portId, (message) => {
                        if (socket.readyState === ws_1.WebSocket.OPEN) {
                            socket.send(JSON.stringify(message));
                        }
                    }, () => messagePorts.delete(portId));
                    messagePorts.set(portId, port);
                    return port;
                });
                dispatchPostMessage(message.channel, message.message, ports, window.id);
                return;
            }
            if (message.type === "message-port-message") {
                messagePorts.get(message.portId)?.receiveMessage(message.data);
                return;
            }
            if (message.type === "message-port-close") {
                messagePorts.get(message.portId)?.disconnect();
                return;
            }
            if (message.type === "workspace-directory-entries-request") {
                const { requestId } = message;
                getWorkspaceDirectoryEntries(message)
                    .then((result) => {
                    const payload = {
                        type: "workspace-directory-entries-result",
                        requestId,
                        ok: true,
                        result,
                    };
                    if (socket.readyState === ws_1.WebSocket.OPEN) {
                        socket.send(JSON.stringify(payload));
                    }
                })
                    .catch((error) => {
                    const payload = {
                        type: "workspace-directory-entries-result",
                        requestId,
                        ok: false,
                        errorMessage: errorMessage(error),
                    };
                    if (socket.readyState === ws_1.WebSocket.OPEN) {
                        socket.send(JSON.stringify(payload));
                    }
                });
                return;
            }
            if (message.type === "ipc-renderer-invoke") {
                const { channel, requestId, args } = message;
                Promise.resolve(bridgeState.handleRendererInvoke?.(channel, args, window.id) ??
                    Promise.reject(new Error(`[ipc-bridge] no ipcMain.handle for channel ${channel}`)))
                    .then((result) => {
                    const payload = {
                        type: "ipc-renderer-invoke-result",
                        requestId,
                        ok: true,
                        result,
                    };
                    if (socket.readyState === ws_1.WebSocket.OPEN) {
                        socket.send(JSON.stringify(payload));
                    }
                })
                    .catch((error) => {
                    const payload = {
                        type: "ipc-renderer-invoke-result",
                        requestId,
                        ok: false,
                        errorMessage: errorMessage(error),
                    };
                    if (socket.readyState === ws_1.WebSocket.OPEN) {
                        socket.send(JSON.stringify(payload));
                    }
                });
            }
        });
    });
    await app.listen({ host: options.host, port: options.port });
    console.log(`IPC bridge listening at ws://${options.host}:${options.port}`);
    ensureElectronLikeProcessContext();
    (0, module_1.installModuleAliasHook)();
    const packageJson = JSON.parse(await promises_1.default.readFile(node_path_1.default.resolve(__dirname, "../../scratch/asar/package.json"), "utf8"));
    globalThis.__CODEX_SHIM_VALUES__ = {
        version: packageJson.version,
    };
    const matches = await (0, glob_1.glob)("../../scratch/asar/.vite/build/main-*.js", {
        nodir: true,
        cwd: __dirname,
    });
    if (matches.length === 0) {
        throw new Error("no main bundle found");
    }
    if (matches.length > 1) {
        throw new Error("multiple main bundles found");
    }
    const module = require(matches[0]);
    module.runMainAppStartup();
}
async function main(args) {
    const options = parseServerArgs(args);
    await startIpcBridgeServer(options);
}
main(process.argv.slice(2));
//# sourceMappingURL=main.js.map