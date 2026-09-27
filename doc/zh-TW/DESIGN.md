---
name: project-design-zh-tw
description: 專案架構與設計限制
metadata:
  version: "1.0.0"
  lang: "zh-TW"
---

# Codex 網頁 — 設計

## 多語言

[English](../DESIGN.md) | [简体中文](../zh-CN/DESIGN.md) | **繁體中文(台灣)** | [繁體中文(香港)](../zh-HK/DESIGN.md) | [हिन्दी](../hi/DESIGN.md) | [Español](../es/DESIGN.md) | [العربية](../ar/DESIGN.md) | [Français](../fr/DESIGN.md)

## 文件

- 專案概覽:[README](README.md)

- 設計考量:[DESIGN](DESIGN.md)

- 發行歷史:[LOG](LOG.md)

- 第三方聲明:[THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md)

## 設計目標

- 將桌面用戶端保留在瀏覽器中, 同時 Codex CLI 和檔案系統保留在主機上.
- 保留上游 npm, Nix, 提取和修補程式路徑, 以便可以整合上游版本.
- 用瀏覽器操作或明確的不可用狀態取代僅限桌面的控制項.
- 除非明確信任客戶端 IP, 否則需要對 HTTP 和 WebSocket 存取進行驗證.

## 架構

`scripts/prepare`獲得桌面捆綁包.`scripts/prepare_asar`將其提取到忽略中`scratch/asar/`樹, 美化補丁目標, 套用來自的有序補丁`patches/`, 並調整區域設定資產. Vite 建置瀏覽器程式碼; TypeScript 建置`src/server/`. `deploy/start.sh`在啟動伺服器之前選擇 Node 運行時和 Git.伺服器託管已修補的 UI, 經過驗證的 API, 檔案路由以及通往本機 Codex CLI 的橋接器.單獨的文件瀏覽器實例可以在其自己的連接埠和登入上提供本機文件.

部署的應用程式位於`~/Desktop/apps/codex-web`在此主機上.之前的`~/Desktop/app/codex-web`部署仍可回滾.`~/Desktop/apps/PORTS.md`記錄目前的服務連接埠.

Web 主機和擷取的用戶端分別進行版本控制.`scripts/prepare_asar`記錄客戶端補丁的順序, 同時`assets/`包含小型第一方頁面和視窗助手.瀏覽器使用同源身份驗證路由進行本機文件預覽和下載.憑證和可信任 IP 的設定位於結帳之外, 因此重建不會重置存取權限.

## 設計限制

- 保留列出的上游根條目[LOG](LOG.md#preserved-upstream-root-entries).新的第一方文件使用標準項目目錄.
- 透過可重現的補丁更改提取的桌面程式碼`patches/`並將他們的訂單登記在`scripts/prepare_asar`.不承諾`scratch/asar/`.
- 瀏覽器檔案操作必須透過經過驗證的伺服器路由.靜態網站預覽不會執行目標專案的後端.
- 刪除未傳送附件的 UI 控制項必須呼叫 Composer 的現有刪除回呼; 傳送的內容沒有刪除動作.
- 伺服器更改需要重新啟動服務.首先準備並檢查, 然後要求明確確認, 因為重新啟動會中斷即時對話.無需重新啟動進程即可檢查靜態資產替換.

## 數據設計

身份驗證雜湊值和可信任 IP 清單預設為`~/.config/codex-web/`.會話由伺服器保留並在 12 小時後過期.專案文件保留在其原始主機路徑中; 瀏覽器和靜態預覽不會將它們複製到此儲存庫中.建構提取輸出被忽略`scratch/asar/`, 可分配的輸出屬於`dist/`.

## 外部介面

伺服器呼叫 Codex CLI 和 Git 作為主機進程, 並向瀏覽器公開經過驗證的 HTTP 和同源 WebSocket 路由.文件瀏覽器是具有獨立身份驗證的單獨服務.此版本從 URL 下載版本化的桌麵包`scripts/prepare`.

## 擴大

瀏覽器行為透過有序補丁進行擴展`patches/`或第一方模組`src/`.在重新調整修補程式基礎之前, 先檢查並檢查提取的桌面版本, 然後建立並檢查產生的 JavaScript.調整 UI 時, 將瀏覽器可見的文字保留在桌面用戶端的本地化系統中.
