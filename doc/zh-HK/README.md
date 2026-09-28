---
name: project-readme-zh-hk
description: 項目概覽與使用說明
metadata:
  version: "1.0.0"
  lang: "zh-HK"
---

# 法典網

## 多語言

[English](../../README.md) | [简体中文](../zh-CN/README.md) | [繁體中文(台灣)](../zh-TW/README.md) | **繁體中文(香港)** | [हिन्दी](../hi/README.md) | [Español](../es/README.md) | [العربية](../ar/README.md) | [Français](../fr/README.md)

## 文件

- 項目概覽:[README](README.md)

- 設計理據:[DESIGN](DESIGN.md)

- 發佈歷史:[LOG](LOG.md)

- 第三方聲明:[THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md)

## 簡介

此分支在瀏覽器中執行 Codex 桌面介面, 同時在您控制的電腦上保留 Codex CLI 和檔案存取權限.它添加了瀏覽器身份驗證, 本機文件操作, 靜態網站預覽以及僅限桌面控制項的修復.在建置過程中, 桌面應用程式被提取並使用版本化補丁進行修改.

## 要求

- 最低: Node.js 和 npm 相容`package.json`, Git, 登入的 Codex CLI 以及支援提取的 Codex 桌面套件.建置需要網路存取來獲取該套件.瀏覽器必須能夠存取所選的主機和連接埠.
- 建議: 在 HTTPS 或加密隧道後面運行.使用專用主機帳戶並將服務保持在受信任的網路上.捆綁的 UI 和經過驗證的 API 可以使用該帳戶的檔案和命令權限進行操作.

## 安裝

### 快速安裝

從準備好的桌面捆綁包和已安裝的依賴項的結帳中, 運行`npm run prepare && ./deploy/start.sh`.伺服器監聽`127.0.0.1:8214`預設情況下.

### 正常安裝

1. 安裝 Node.js, npm, Git 和 Codex CLI; 登入`codex login --device-auth`.
2. 跑步`npm ci`,  然後`npm run prepare`.建構提取桌麵包, 應用`patches/*.patch`, 建立瀏覽器和伺服器, 並建立壓縮的 Web 資產.
3. 對於網路部署, 請使用下列命令建立憑證`node scripts/set-auth-password.mjs USERNAME`;安全地記錄產生的密碼.
4. 跑步`./deploy/start.sh --host HOST --port PORT`, 然後開啟符合的 URL.看[Design](doc/DESIGN.md)用於部署佈局和邊界.

## 指引

- 瀏覽器 UI 使用主機上登入的 Codex CLI.如果配置了本機文件, 則可以在單獨的文件瀏覽器服務中下載或開啟本機檔案.
- 網站資源開啟僅供查看的靜態預覽.它不會啟動該網站的後端.
- 等待發送的圖像可以從其縮圖或全螢幕預覽中刪除.刪除它會阻止它被包含在草稿中.
- 此網站不會同步 ChatGPT 網頁或手機上的一般聊天記錄. 語音功能在此不可用, 語音設定頁會顯示提示. 左下角問號選單可開啟本項目的更新記錄. 更新記錄會使用 Codex Web 設定中的語言.
- `CODEX_CLI_PATH`選擇 CLI.`CODEX_WEB_NODE_BIN_DIR`和`CODEX_WEB_GIT_BIN_DIR`當運行時工具目錄在外部時選擇它們`PATH`. `CODEX_WEB_AUTH_FILE`和`CODEX_WEB_TRUSTED_IPS_FILE`選擇身份驗證文件.請參閱[previous upstream-oriented README](third_party/codex-web/README.previous.md)用於憑證輪替和可信任 IP 指令.
- 替換 Web 資源而不更改其檔案名稱後, 可能需要進行硬刷新, 因為版本化資源可以短暫快取.

## 升級

1. 備份`~/.config/codex-web/auth.json`和`~/.config/codex-web/trusted-ips.json`, 並記錄運行版本和部署路徑.
2. 在單獨的結帳中提取所需的修訂並運行`npm ci && npm run prepare`.在部署之前, 根據桌面捆綁版本檢查任何失敗的修補程式.
3. 將準備好的檔案複製到部署目錄中.單獨替換靜態資源不需要重啟伺服器; 伺服器變更確實如此.操作員啟動的重啟會中斷活動的對話和任務, 因此在準備和檢查後, 請獲得使用者對該特定重啟的明確確認.
4. 開啟登入頁面並驗證登入, 瀏覽器 UI 和變更的功能.保留先前的部署, 直到這些檢查通過.看[Upgrading](UPGRADING.md)對於繼承的更新工作流程.

## 移除

- 快速: 停止服務並刪除應用程式簽出或部署目錄.如果您希望重新安裝, 請保留設定檔.
- 完成: 同時刪除systemd用戶服務, `~/.config/codex-web/auth.json`, `~/.config/codex-web/trusted-ips.json`, 以及您擁有的任何單獨儲存的執行時間或檔案瀏覽器資料.如果這些路徑與其他部署共用, 請在刪除前查看這些路徑.

## 致謝

這是一個叉子[0xcaff/codex-web](https://github.com/0xcaff/codex-web)並適配 Codex 桌面用戶端.依賴關係和桌麵包歸屬狀態記錄在[Third-party notices](doc/THIRD_PARTY_NOTICES.md).

## 授權條款

`package.json`宣稱`MIT`(SPDX).此結帳不包含完整的上游許可證文字; 必須單獨審查提取的桌面應用程式的重新分發權利.看[Third-party notices](doc/THIRD_PARTY_NOTICES.md).
