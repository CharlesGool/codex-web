---
name: project-design-zh-cn
description: 项目架构与设计约束
metadata:
  version: "1.0.0"
  lang: "zh-CN"
---

# Codex 网页 — 设计

## 多语言

[English](../DESIGN.md) | **简体中文** | [繁體中文(台灣)](../zh-TW/DESIGN.md) | [繁體中文(香港)](../zh-HK/DESIGN.md) | [हिन्दी](../hi/DESIGN.md) | [Español](../es/DESIGN.md) | [العربية](../ar/DESIGN.md) | [Français](../fr/DESIGN.md)

## 文档

- 项目概览:[README](README.md)

- 设计思路:[DESIGN](DESIGN.md)

- 发布历史:[LOG](LOG.md)

- 第三方声明:[THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md)

## 设计目标

- 在浏览器中使用桌面客户端界面, Codex CLI 和文件系统仍运行在主机上.
- 保留上游的 npm, Nix, 提取和补丁路径, 方便以后整合上游更新.
- 将桌面专用控件改为浏览器操作, 或明确显示不可用状态.
- HTTP 和 WebSocket 访问需要认证; 受信任的客户端 IP 也需要在登录页主动选择免密进入.

## 架构

`scripts/prepare` 获取桌面程序包. `scripts/prepare_asar` 将其提取到被 Git 忽略的 `scratch/asar/`, 格式化补丁目标文件, 按顺序应用 `patches/` 中的补丁, 并调整语言资源. Vite 构建浏览器代码, TypeScript 构建 `src/server/`. `deploy/start.sh` 选择 Node 和 Git 的运行路径并启动服务. 服务向浏览器提供修补后的界面, 需要认证的 API, 文件路由, 以及通往本机 Codex CLI 的连接. 如有需要, 可另行部署使用独立端口和登录的 File Browser 来访问本地文件.

本机部署位于 `~/Desktop/apps/codex-web`. 旧部署 `~/Desktop/app/codex-web` 暂时保留, 供回滚使用. `~/Desktop/apps/PORTS.md` 记录当前服务端口.

网页服务与提取出的客户端分别维护. `scripts/prepare_asar` 记录客户端补丁的应用顺序; `assets/` 存放少量项目自有的页面和视口辅助脚本. 浏览器通过同源且需要认证的路由预览和下载本地文件. 登录凭据与可信 IP 配置存放在代码目录外, 因此重新构建不会清空这些设置.

## 设计约束

- 保留[日志](LOG.md#preserved-upstream-root-entries)中列出的上游根目录条目. 新增的项目自有文件按标准目录放置.
- 对提取出的桌面代码, 通过 `patches/` 中可重放的补丁修改, 并在 `scripts/prepare_asar` 登记顺序. 不将 `scratch/asar/` 提交到 Git.
- 浏览器文件操作需经过已认证的服务端路由. 网站静态预览不会运行目标项目的后端.
- 移除尚未发送附件的控件需调用输入框已有的移除回调; 已发送的内容不显示移除操作.
- 服务端代码更新需要重启服务. 应先准备并检查, 再就本次重启取得明确同意, 因为它会打断正在进行的对话. 仅替换静态网页资源无需重启进程.

## 数据设计

认证哈希和可信 IP 列表默认保存在 `~/.config/codex-web/`. 会话保存在服务端, 12 小时后失效. 项目文件仍留在主机原有路径; 浏览器及静态预览不会将它们复制进此仓库. 提取出的构建文件放在被忽略的 `scratch/asar/`, 分发输出放在 `dist/`.

## 外部接口

服务以主机进程调用 Codex CLI 和 Git, 并向浏览器提供需要认证的 HTTP 和同源 WebSocket 接口. File Browser 是使用独立认证的单独服务. 构建过程从 `scripts/prepare` 中记录的网址下载指定版本的桌面程序包.

## 扩展

浏览器行为通过 `patches/` 中按顺序应用的补丁或 `src/` 下的项目自有模块扩展. 更新提取的桌面版本时, 先检查版本和补丁适配情况, 再构建并检查生成的 JavaScript. 修改界面时, 浏览器可见文案应继续使用桌面客户端的本地化机制.
