---
name: project-log
description: Current work, decisions, and handoff for this fork
metadata:
  version: "0.1.0"
  lang: "en"
---

# Log

This log records work on the web host. It does not replace the upstream project's release history.

## Decisions

| Decision | Reason |
| --- | --- |
| Open local website resources as static browser previews, preferring a sibling `dist/index.html`. | The user requested a view-only preview. The preview does not start a project's backend. |
| Show an unavailable message on the Pets settings page. | The feature is not usable in this web host. |
| Hide the desktop application menu in the web UI. | Its Electron-only commands have no usable browser action. |
| Replace local file context-menu app targets with File Browser and download actions. | Desktop app targets and the native save dialog do not work in the browser. Remote-host actions retain their original behavior. |
| Hide the default file open destination setting in the web UI. | Its Desktop app, File Manager, and Terminal choices do not control the browser file actions. |

## Handoff

- Branch: `main`. These changes were based on `b4a5577`; use Git history for the current commit.
- Completed: Added a protected static website preview route; changed the website resource card to open it; replaced Pets settings content; hid the desktop application menu; replaced the local file context-menu open targets and Save As action with File Browser and download actions; hid the obsolete default file open destination setting.
- Checks: The server TypeScript build, webview patch application, changed JavaScript syntax, focused local file-menu action test, `git diff --check`, shell syntax check, and document format check passed. A browser interaction check was not completed.
- Deployment: The changed server and webview files were copied to the existing deployment. The service is active, and Codex Web and File Browser are listening on their existing addresses. A full browser interaction check has not been completed.
- GitHub: The local commit is ready. Pushing to `origin/main` is blocked because HTTPS credentials are unavailable and SSH authentication was denied.
- Remaining: Hard refresh the web page and verify the local file right-click menu, download, File Browser link, website preview, Pets page, and removal of the default file open destination setting. Check remote file menus separately if those workflows are used.
- Next action: Complete the browser interaction check and address any behavior it reveals; push the commit after GitHub authentication is available.

## Changelog

### 0.0.1 (unreleased; work updated 2026-09-27)

#### Changed

- Local file context menus now offer browser-capable file actions.
- Pets settings displays an unavailable state. The desktop application menu and obsolete default file open destination setting are hidden in the web UI.

#### Fixed

- Local website resource cards open a static browser preview instead of invoking the unavailable in-app browser.
