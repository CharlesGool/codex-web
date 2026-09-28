---
name: project-readme
description: Codex Web fork overview and usage
metadata:
  version: "1.0.0"
  lang: "en"
---

# Codex Web

## Multi-language

**English** | [简体中文](doc/zh-CN/README.md) | [繁體中文 (台灣)](doc/zh-TW/README.md) | [繁體中文 (香港)](doc/zh-HK/README.md) | [हिन्दी](doc/hi/README.md) | [Español](doc/es/README.md) | [العربية](doc/ar/README.md) | [Français](doc/fr/README.md)

## Documentation

- Project overview: [README](README.md)

- Design rationale: [DESIGN](doc/DESIGN.md)

- Release history: [LOG](doc/LOG.md)

- Third-party notices: [THIRD_PARTY_NOTICES](doc/THIRD_PARTY_NOTICES.md)

## Introduction

This fork runs the Codex desktop interface in a browser while keeping the Codex CLI and file access on a machine you control. It adds browser authentication, local file actions, a static website preview, and fixes for desktop-only controls. The desktop application is extracted and modified with versioned patches during the build.

## Requirements

- Minimum: Node.js and npm compatible with `package.json`, Git, a signed-in Codex CLI, and a supported Codex desktop bundle for extraction. The build needs network access to fetch that bundle. A browser must be able to reach the chosen host and port.
- Recommended: Run behind HTTPS or an encrypted tunnel. Use a dedicated host account and keep the service on a trusted network. The bundled UI and authenticated API can operate with that account's file and command permissions.

## Install

### Quick install

From a checkout with a prepared desktop bundle and installed dependencies, run `npm run prepare && ./deploy/start.sh`. The server listens on `127.0.0.1:8214` by default.

### Normal install

1. Install Node.js, npm, Git, and Codex CLI; sign in with `codex login --device-auth`.
2. Run `npm ci`, then `npm run prepare`. The build extracts the desktop bundle, applies `patches/*.patch`, builds the browser and server, and creates compressed web assets.
3. For a network deployment, create credentials with `node scripts/set-auth-password.mjs USERNAME`; record the generated password securely.
4. Run `./deploy/start.sh --host HOST --port PORT`, then open the matching URL. See [Design](doc/DESIGN.md) for the deployment layout and boundaries.

## Guidance

- The browser UI uses the signed-in Codex CLI on the host. Local files can be downloaded or opened in a separate File Browser service if one is configured.
- A website resource opens a view-only static preview. It does not start that website's backend.
- An image awaiting send can be removed from either its thumbnail or the full-screen preview. Removing it stops it from being included in the draft.
- The browser host does not synchronize ordinary ChatGPT chats from the web or mobile. Voice controls are unavailable here; the Voice settings page shows that state. The question-mark menu opens this fork's changelog in the selected app language.
- `CODEX_CLI_PATH` selects the CLI. `CODEX_WEB_NODE_BIN_DIR` and `CODEX_WEB_GIT_BIN_DIR` select runtime tool directories when they are outside `PATH`. `CODEX_WEB_AUTH_FILE` and `CODEX_WEB_TRUSTED_IPS_FILE` select authentication files. See the [previous upstream-oriented README](third_party/codex-web/README.previous.md) for credential rotation and trusted-IP commands.
- A hard refresh may be needed after replacing a web asset without changing its filename because versioned assets can be cached briefly.

## Upgrade

1. Back up `~/.config/codex-web/auth.json` and `~/.config/codex-web/trusted-ips.json`, and record the running version and deployment path.
2. Pull the desired revision in a separate checkout and run `npm ci && npm run prepare`. Review any failed patch against the desktop bundle version before deploying.
3. Copy the prepared files into the deployment directory. Replacing static assets alone does not require a server restart; server changes do. An operator-initiated restart interrupts active conversations and tasks, so obtain explicit user confirmation for that specific restart after preparation and checks.
4. Open the login page and verify sign-in, the browser UI, and the changed feature. Retain the previous deployment until these checks pass. See [Upgrading](UPGRADING.md) for the inherited update workflow.

## Uninstall

- Quick: stop the service and remove the application checkout or deployment directory. Keep the config files if you expect to reinstall.
- Complete: also remove the systemd user service, `~/.config/codex-web/auth.json`, `~/.config/codex-web/trusted-ips.json`, and any separately stored runtime or File Browser data you own. Review those paths before deletion if shared by another deployment.

## Acknowledgements

This is a fork of [0xcaff/codex-web](https://github.com/0xcaff/codex-web) and adapts the Codex desktop client. Dependency and desktop bundle attribution status is recorded in [Third-party notices](doc/THIRD_PARTY_NOTICES.md).

## License

`package.json` declares `MIT` (SPDX). This checkout does not contain a complete upstream license text; redistribution rights for the extracted desktop application must be reviewed separately. See [Third-party notices](doc/THIRD_PARTY_NOTICES.md).
