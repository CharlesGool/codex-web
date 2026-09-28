---
name: project-log
description: Current work, decisions, and handoff for this fork
metadata:
  version: "0.1.0"
  lang: "en"
---

# Log

## Multi-language

**English** | [简体中文](zh-CN/LOG.md) | [繁體中文 (台灣)](zh-TW/LOG.md) | [繁體中文 (香港)](zh-HK/LOG.md) | [हिन्दी](hi/LOG.md) | [Español](es/LOG.md) | [العربية](ar/LOG.md) | [Français](fr/LOG.md)

## Documentation

- Project overview: [README](../README.md)

- Design rationale: [DESIGN](DESIGN.md)

- Release history: [LOG](LOG.md)

- Third-party notices: [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md)

## Bugs

This log records work on the web host. It does not replace the upstream project's release history.

Restarting `codex-web.service` interrupts active browser WebSockets and the Codex app-server child process. A rolling update mechanism was considered but not implemented. The user chose an explicit confirmation gate for every restart instead.

## Limitations

Upstream baseline: `0dfdc10`

Reason: The fork keeps the upstream npm and Nix package roots and its extract-then-patch workflow. Moving these inherited entries would change package paths and complicate upstream updates. Generated `scratch/` extraction output remains ignored by Git and is only used by the inherited build workflow.

Update boundary: Only root entries present in the recorded baseline are preserved here. New first-party files use the standard project directories; any newly inherited upstream entry requires review and an exact inventory update.

Documentation and licensing review: The upstream checkout declares MIT in `package.json` but contains no complete license text. The extracted desktop bundle and npm dependency notices have not been fully audited. See [Third-party notices](THIRD_PARTY_NOTICES.md). This limits claims about redistributing extracted or bundled artifacts.

### Preserved upstream root entries

- `ARCHITECTURE.md`
- `UPGRADING.md`
- `default.nix`
- `flake.lock`
- `flake.nix`
- `nix`
- `package-lock.json`
- `package.json`
- `patches`
- `vite.browser.config.ts`

## Decisions

| Decision | Reason |
| --- | --- |
| Open local website resources as static browser previews, preferring a sibling `dist/index.html`. | The user requested a view-only preview. The preview does not start a project's backend. |
| Show an unavailable message on the Pets settings page. | The feature is not usable in this web host. |
| Show the same unavailable state on Computer Use settings and remove its Chrome setup shortcut from Help. | The inherited desktop integration cannot be configured through this browser host, so the existing control page gives a misleading installation path. |
| Show an unavailable state on the Scheduled tasks route in this web deployment. | Local scheduling is limited to the Electron client in the inherited capability registry, and the available cloud list currently fails; the page otherwise advertises task creation through a failing flow. This does not claim that browser-hosted scheduling is impossible in principle. |
| Hide the desktop application menu in the web UI. | Its Electron-only commands have no usable browser action. |
| Put the About project link in the sidebar question-mark menu. | The desktop application menu is not mounted in the browser, so its upper-left About entry was invisible. The visible help menu can open this fork without restoring File, Edit, View, and Help. |
| Replace local file context-menu app targets with File Browser and download actions. | Desktop app targets and the native save dialog do not work in the browser. Remote-host actions retain their original behavior. |
| Hide the default file open destination setting in the web UI. | Its Desktop app, File Manager, and Terminal choices do not control the browser file actions. |
| Download local archive links in conversation messages when clicked. | The desktop file-open action has no usable browser target for these files. |
| Preserve the inherited npm, Nix, and patch layout at the repository root. | This keeps upstream updates and the extract-then-patch build compatible; the exact baseline entries are inventoried above. |
| Move the deployment to `~/Desktop/apps/codex-web`, with Node inside that directory. | The launcher then uses one self-contained deployment path; the prior deployment remains for rollback. |
| Remove an unsent image from its full-screen preview through the attachment's existing removal callback. | The preview action must match the thumbnail X and must not appear on already sent images. |
| Use a text label for removal in the full-screen preview toolbar. | A second X beside Close was visually confusing; the text button keeps the toolbar style and makes the actions distinct. |
| Give the login page a centered card with account and password fields and a real trusted-IP check. | The reference layout improves hierarchy; the secondary action checks the existing server allowlist and explains denial. |
| Keep the login page as the entry point after logout, including for trusted IPs. | Trusted IP access is selected explicitly on the login page; an IP alone does not create a session. |
| Require explicit user confirmation before every operator-initiated Codex Web restart or replacement of its running process. | A restart interrupts active conversations and tasks. Complete reversible preparation and checks first, describe the specific service and expected interruption, then wait for the user's affirmative answer. An idle period or earlier approval does not authorize a later restart. The existing systemd `Restart=always` recovery after a process failure is separate from an operator-initiated restart. |
| Keep the rolling update proposal as historical design only. | The user preferred an explicit confirmation gate over adding proxy and overlapping backend complexity. No proxy or task migration was implemented. |
| Open a local chat in a browser tab from both the header menu and the sidebar row menu. | The desktop new-window IPC action does not open a usable browser window. Both menus now use the browser's `/thread/<id>` route, and the sidebar row exposes its menu button in Codex mode. Remote-host chats are excluded because the browser route does not restore their host context. |
| Preview local files linked from a conversation in an authenticated browser tab. | The desktop file editor tab can fail to render in the web host. The preview reads through the existing authenticated download endpoint, displays text, images, or PDFs, and offers download. Remote-host links keep their original action. |
| Add a search button to the conversation header using the existing find-in-chat command. | The client already has a find bar with match counts and previous/next navigation; the header lacked a visible entry point. |
| Size the web app to the browser's visual viewport on mobile and tablet. | The inherited `100vh` root and shell heights can exceed the area left by dynamic browser bars or the on-screen keyboard. The visual viewport also reports its top offset, which can change while the keyboard is visible. |
| Show voice and ordinary ChatGPT chat history as unavailable in this browser host. | The deployed HTTP page has no microphone access, desktop voice features do not transfer automatically, and the local Codex app-server does not list ordinary ChatGPT account chats. Hide voice actions while retaining Codex chat history. |
| Open a local changelog page from the sidebar question-mark menu. | The user requested a visible update history for this fork; the page reads the localized changelog bundled with the static assets. |

## Handoff

- Branch: `main`, fast-forwarded from `feat/standardize-layout`. The browser and documentation changes are published on the default branch.
- Completed: Kept the upstream extract-then-patch layout, added standard project directories and a new `deploy/start.sh`, and documented the deployment boundaries. Browser fixes cover login and trusted IPs, file actions and previews, static website previews, unsent image removal, conversation search, opening chats in a browser tab, mobile viewport sizing, and unavailable desktop-only features. The help menu links to this fork. The current work hides voice actions, marks Voice settings and ordinary ChatGPT history unavailable, and adds a local changelog page. These static assets were installed on the live site without a restart.
- Checks: Earlier patch replay, JavaScript syntax, authentication, and browser-size checks passed. This pass rebuilt the extracted client from the desktop package through asset compression, checked both changed JavaScript bundles and the changelog script syntax, rendered the changelog for all eight documentation languages in a script harness, and passed the 32-document format, translation, and project-structure checks with 0 errors. Playwright could not run because Chrome is not installed. Authenticated browser checks remain outstanding.
- Deployment: `codex-web.service` remains active on its registered LAN endpoint with the same process started on 2026-09-27. Its static assets were updated under `~/Desktop/apps/codex-web`; the earlier deployment at `~/Desktop/app/codex-web` and a backup of the replaced files remain available for rollback. The changelog route returned HTTP 401 without a session, as expected. Any future operator-initiated restart requires fresh, explicit user confirmation after the impact is stated.
- GitHub: The public `CharlesGool/codex-web` repository uses `main`; commit `6f83e02` was pushed and the remote branch was verified.
- Remaining: Review natural wording in all translated documents and the third-party license texts. Test the changed UI after a hard refresh in an authenticated browser, including the voice controls, ChatGPT history notice, changelog menu and page, and physical iPhone, Android, and tablet portrait and landscape layouts. No rolling update is planned. No temporary project rules file was found.
- Next action: Complete an authenticated browser check when Chrome is available.

## Changelog

### 0.0.1 (unreleased; work updated 2026-09-28)

#### Changed

- Local file context menus now offer browser-capable file actions.
- The sidebar question-mark menu now links to this fork on GitHub; the desktop-only application menus remain hidden. The conversation search field now matches the white surface and subtle shadow of existing menus.
- Pets, keyboard shortcuts, and Computer Use settings display an unavailable state; the sidebar Help menu no longer offers Chrome extension setup. Scheduled tasks now shows a deployment-specific unavailable state instead of a broken cloud list and task suggestions. The pet profile action, pet slash command, shortcut help entry, app shortcut bindings, desktop application menu, and obsolete default file open destination setting are hidden or disabled in the web UI.
- The project keeps the inherited upstream build layout while moving new first-party structure and the service launcher into standard directories.
- Browser voice controls are hidden or shown as unavailable, and the ChatGPT chat-history area explains that ordinary web and mobile chats cannot be synchronized here. The sidebar help menu now opens a local changelog page.

#### Fixed

- Local website resource cards open a static browser preview instead of invoking the unavailable in-app browser.
- Local archive links in conversation messages download the referenced file instead of invoking an unavailable desktop application.
- The full-screen preview of an unsent image now includes an action that removes it from the draft.
- The preview removal action now displays text instead of an X, and the login page uses the redesigned account/password form with a working trusted-IP check.
- The chat menu's new-window action opens a browser tab, and Codex sidebar chat rows expose the same menu.
- Conversation file links open a browser preview with a download button instead of a tab that fails to render.
- The conversation header now offers a search button that opens the existing find bar.
- Mobile and tablet layouts now follow the visible viewport when browser bars, rotation, or the keyboard change available height.

## Commit History

| Commit | Summary |
| --- | --- |
| `b27d4e4` | Replace unsupported desktop actions in the browser UI. |
| `33d3851` | Download linked local archives on click. |
| `1f98f69` | Record the standardization audit. |
| `35394f5` | Remove unsent images from the preview. |
| `b10b9e5` | Align the preview action and redesign login. |
| `b11f385` | Finalize browser fixes and project documentation. |
| `7347aa6` | Record the verified GitHub handoff. |
| `47b2ab3` | Record promotion to the default branch. |
| `6f83e02` | Mark unavailable browser features and add the changelog page. |
| Current commit | Record the verified GitHub handoff. |

The Git log remains the authoritative history.
