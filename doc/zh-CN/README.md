---
name: project-readme-zh-cn
description: 项目概览与使用说明
metadata:
  version: "1.0.0"
  lang: "zh-CN"
---

# 法典网

## 多语言

[English](../../README.md) | **简体中文** | [繁體中文(台灣)](../zh-TW/README.md) | [繁體中文(香港)](../zh-HK/README.md) | [हिन्दी](../hi/README.md) | [Español](../es/README.md) | [العربية](../ar/README.md) | [Français](../fr/README.md)

## 文档

- 项目概览:[README](README.md)

- 设计思路:[DESIGN](DESIGN.md)

- 发布历史:[LOG](LOG.md)

- 第三方声明:[THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md)

## 简介

这个 fork 将 Codex 桌面界面放到浏览器中运行, Codex CLI 和文件访问仍由你控制的主机提供.它增加了网页登录, 本地文件操作, 网站静态预览, 并修正了无法在浏览器中使用的桌面控件.构建时会提取桌面应用, 再通过有版本记录的补丁修改界面.

## 要求

- 最低要求: 与 `package.json` 兼容的 Node.js 和 npm, Git, 已登录的 Codex CLI, 以及可供提取的受支持 Codex 桌面程序包.构建时需要联网下载该程序包.浏览器须能访问所选的主机和端口.
- 建议: 通过 HTTPS 或加密隧道访问; 使用专用的主机账户, 并将服务放在可信网络中.网页及其已认证的 API 能以该主机账户的权限访问文件和运行命令.

## 安装

### 快速安装

在已安装依赖, 并已准备桌面程序包的代码目录中运行 `npm run prepare && ./deploy/start.sh`.默认监听 `127.0.0.1:8214`.

### 正常安装

1. 安装 Node.js, npm, Git 和 Codex CLI; 使用 `codex login --device-auth` 登录.
2. 运行 `npm ci`, 再运行 `npm run prepare`.构建过程会提取桌面程序包, 应用 `patches/*.patch`, 构建网页与服务端, 并生成压缩的网页资源.
3. 如需通过网络访问, 运行 `node scripts/set-auth-password.mjs USERNAME` 创建登录凭据, 并妥善保存生成的密码.
4. 运行 `./deploy/start.sh --host HOST --port PORT`, 再打开对应网址.部署目录和边界见[设计文档](doc/DESIGN.md).

## 指南

- 网页使用主机上已登录的 Codex CLI.本地文件可以下载; 如果另行配置了 File Browser, 也可以在那里打开.
- 网站资源只会打开静态界面预览, 不会启动该网站的后端.
- 尚未发送的图片可从缩略图或全屏预览中移除; 移除后不会随草稿发送.
- `CODEX_CLI_PATH` 用于选择 CLI.运行工具不在 `PATH` 中时, 可用 `CODEX_WEB_NODE_BIN_DIR` 和 `CODEX_WEB_GIT_BIN_DIR` 指定目录.`CODEX_WEB_AUTH_FILE` 与 `CODEX_WEB_TRUSTED_IPS_FILE` 用于指定认证文件.轮换密码和管理可信 IP 的命令见[原项目说明存档](third_party/codex-web/README.previous.md).
- 如果替换网页资源后文件名没有变化, 浏览器可能短暂使用缓存; 此时请强制刷新页面.

## 升级

1. 备份 `~/.config/codex-web/auth.json` 和 `~/.config/codex-web/trusted-ips.json`, 记下当前版本及部署路径.
2. 在单独的代码目录中拉取目标版本, 运行 `npm ci && npm run prepare`.如补丁应用失败, 先对照桌面程序包版本检查, 再继续部署.
3. 将准备好的文件复制到部署目录.仅替换静态资源无需重启服务; 修改服务端则需要重启.主动重启会中断正在进行的对话和任务, 因此应在准备和检查完成后, 就该次重启取得用户明确同意.
4. 打开登录页, 验证登录, 网页和本次修改的功能.验证通过前保留旧部署.继承自上游的更新流程见[升级说明](UPGRADING.md).

## 卸载

- 简单卸载: 停止服务, 删除代码目录或部署目录.如打算重新安装, 可保留配置文件.
- 完整卸载: 另行移除 systemd 用户服务, `~/.config/codex-web/auth.json`, `~/.config/codex-web/trusted-ips.json`, 以及你单独保存的运行环境或 File Browser 数据.如果这些路径由其他部署共用, 请先核实再删除.

## 致谢

本项目基于 [0xcaff/codex-web](https://github.com/0xcaff/codex-web), 并适配 Codex 桌面客户端.依赖项及桌面程序包的署名核查状态见[第三方声明](doc/THIRD_PARTY_NOTICES.md).

## 许可证

`package.json` 声明 `MIT`(SPDX 标识).当前代码目录没有完整的上游许可证正文; 提取出的桌面程序能否再分发仍需单独核查.详见[第三方声明](doc/THIRD_PARTY_NOTICES.md).
