---
name: project-third-party-notices-zh-tw
description: 第三方署名與合規聲明
metadata:
  version: "1.0.0"
  lang: "zh-TW"
---

# 第三方通知

## 多語言

[English](../THIRD_PARTY_NOTICES.md) | [简体中文](../zh-CN/THIRD_PARTY_NOTICES.md) | **繁體中文(台灣)** | [繁體中文(香港)](../zh-HK/THIRD_PARTY_NOTICES.md) | [हिन्दी](../hi/THIRD_PARTY_NOTICES.md) | [Español](../es/THIRD_PARTY_NOTICES.md) | [العربية](../ar/THIRD_PARTY_NOTICES.md) | [Français](../fr/THIRD_PARTY_NOTICES.md)

## 文件

- 專案概覽:[README](README.md)

- 設計考量:[DESIGN](DESIGN.md)

- 發行歷史:[LOG](LOG.md)

- 第三方聲明:[THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md)

## 第三方聲明

|組件/資源|版本/哈希|來源|執照|如何使用|所需的歸屬/通知|解除義務|驗證日期|
| --- | --- | --- | --- | --- | --- | --- | --- |
|0xcaff/codex-web|上游基線`0dfdc10` | [Upstream repository](https://github.com/0xcaff/codex-web) | `MIT`聲明於`package.json`;此結帳中缺少完整的許可證文本|分叉源|保留上游歸屬並確認許可文本|重新分發前審查| 2026-09-27 |
|法典桌面應用程式| `26.901.41123`在`scripts/prepare` |網址記錄在`scripts/prepare` |此結帳未建立|在建置時修補提取的瀏覽器資產|查看原始通知和分發條款|在分配提取的資產或託管衍生品之前進行審查| 2026-09-27 |
|npm 依賴項|確切的軟體包版本位於`package-lock.json` |鎖定檔案中的套件 URL|每包; 本文檔尚未列出|伺服器和建置依賴項|查看每個包的通知和許可證文本|在分發捆綁資產之前進行審查| 2026-09-27 |

## 授權文字和原始碼提供

此簽出不包括完整的上游許可證文字或已提取的桌面應用程式通知的經過驗證的清單.`package-lock.json`記錄依賴項版本, 但不取代其許可證文字.這個分支的來源是這個儲存庫; 上游來源已連結到上面.在分發二進位或提取的桌面捆綁包之前, 仍然需要進行發布合規性審查.如果沒有經過審查, 就不會聲稱有 Copyleft 或分離結論.
