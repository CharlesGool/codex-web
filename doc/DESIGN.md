---
name: project-design
description: Project architecture and design constraints
metadata:
  version: "1.0.0"
  lang: "en"
---

# Codex Web — Design

## Multi-language

**English** | [简体中文](zh-CN/DESIGN.md) | [繁體中文 (台灣)](zh-TW/DESIGN.md) | [繁體中文 (香港)](zh-HK/DESIGN.md) | [हिन्दी](hi/DESIGN.md) | [Español](es/DESIGN.md) | [العربية](ar/DESIGN.md) | [Français](fr/DESIGN.md)

## Documentation

- Project overview: [README](../README.md)

- Design rationale: [DESIGN](DESIGN.md)

- Release history: [LOG](LOG.md)

- Third-party notices: [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md)

## Design Goals

- Keep the desktop client in the browser while the Codex CLI and filesystem remain on the host.
- Preserve upstream npm, Nix, extraction, and patch paths so upstream releases can be integrated.
- Replace desktop-only controls with browser actions or an explicit unavailable state.
- Require authentication for HTTP and WebSocket access unless a client IP has been explicitly trusted.

## Architecture

`scripts/prepare` obtains a desktop bundle. `scripts/prepare_asar` extracts it into the ignored `scratch/asar/` tree, prettifies patch targets, applies ordered patches from `patches/`, and adjusts locale assets. Vite builds browser code; TypeScript builds `src/server/`. `deploy/start.sh` selects a Node runtime and Git before starting the server. The server hosts the patched UI, authenticated APIs, file routes, and a bridge to the local Codex CLI. A separate File Browser instance may serve local files on its own port and login.

The deployed application is under `~/Desktop/apps/codex-web` on this host. The prior `~/Desktop/app/codex-web` deployment remains available for rollback. `~/Desktop/apps/PORTS.md` records the current service ports.

The web host and the extracted client are versioned separately. `scripts/prepare_asar` records the order of client patches, while `assets/` contains small first-party pages and viewport helpers. The browser uses same-origin authenticated routes for local file previews and downloads. Settings for credentials and trusted IPs live outside the checkout so rebuilding does not reset access.

The Help menu passes the app's resolved language to the static changelog page. A direct visit to that page uses the browser language when no app language was passed. Its labels are stored under `lang/changelog/`, and its entries come from the matching translated `doc/LOG.md`.

## Design Constraints

- Keep the upstream root entries listed in [LOG](LOG.md#preserved-upstream-root-entries). New first-party files use standard project directories.
- Change extracted desktop code through reproducible patches in `patches/` and register their order in `scripts/prepare_asar`. Do not commit `scratch/asar/`.
- Browser file actions must pass through authenticated server routes. Static website previews do not execute the target project's backend.
- A UI control that removes an unsent attachment must call the composer's existing removal callback; sent content has no removal action.
- A server change needs a service restart. Prepare and check it first, then ask for explicit confirmation because the restart interrupts live conversations. Static asset replacement can be checked without restarting the process.
- Disable the inherited voice and dictation entry points in this browser deployment. Show an unavailable state on the Voice settings route and on the ChatGPT chat-history list; Codex threads remain available.

## Data Design

Authentication hashes and the trusted IP list default to `~/.config/codex-web/`. Sessions are kept by the server and expire after 12 hours. Project files remain in their original host paths; the browser and static preview do not copy them into this repository. Build extraction output is ignored under `scratch/asar/`, and distributable output belongs in `dist/`.

## External Interfaces

The server invokes Codex CLI and Git as host processes and exposes authenticated HTTP and same-origin WebSocket routes to the browser. File Browser is a separate service with independent authentication. The build downloads a versioned desktop bundle from the URL in `scripts/prepare`.

## Extension

Browser behavior is extended with ordered patches in `patches/` or first-party modules under `src/`. Bump and review the extracted desktop version before rebasing a patch, then build and check the resulting JavaScript. Keep browser-visible text in the desktop client's localization system when adapting that UI.
