---
name: project-third-party-notices-zh-cn
description: 第三方署名与合规声明
metadata:
  version: "1.0.0"
  lang: "zh-CN"
---

# 第三方通知

## 多语言

[English](../THIRD_PARTY_NOTICES.md) | **简体中文** | [繁體中文(台灣)](../zh-TW/THIRD_PARTY_NOTICES.md) | [繁體中文(香港)](../zh-HK/THIRD_PARTY_NOTICES.md) | [हिन्दी](../hi/THIRD_PARTY_NOTICES.md) | [Español](../es/THIRD_PARTY_NOTICES.md) | [العربية](../ar/THIRD_PARTY_NOTICES.md) | [Français](../fr/THIRD_PARTY_NOTICES.md)

## 文档

- 项目概览:[README](README.md)

- 设计思路:[DESIGN](DESIGN.md)

- 发布历史:[LOG](LOG.md)

- 第三方声明:[THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md)

## 第三方声明

| 组件或资源 | 版本或哈希 | 来源 | 许可证 | 用途 | 署名或声明要求 | 发布前事项 | 核查日期 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0xcaff/codex-web | 上游基线 `0dfdc10` | [上游仓库](https://github.com/0xcaff/codex-web) | `package.json` 声明 `MIT`; 当前代码目录缺少完整许可证正文 | fork 的源码基础 | 保留上游署名并确认许可证正文 | 再分发前核查 | 2026-09-27 |
| Codex 桌面应用 | `scripts/prepare` 中的 `26.901.41123` | 网址记录在 `scripts/prepare` | 当前代码目录未能确认 | 构建时提取并修补浏览器资源 | 核对原始声明与分发条款 | 分发提取资源或托管衍生服务前核查 | 2026-09-27 |
| npm 依赖项 | 具体版本见 `package-lock.json` | 来源网址见锁文件 | 各依赖不同; 此文档尚未逐项核查 | 服务端与构建依赖 | 核对各包声明及许可证正文 | 分发打包资源前核查 | 2026-09-27 |

## 许可证正文与源码提供

当前代码目录没有完整的上游许可证正文, 也没有经过核实的桌面应用声明清单. `package-lock.json` 记录了依赖项版本, 但不能代替许可证正文. 此 fork 的源码位于本仓库, 上游源码链接见上表. 在分发二进制文件或提取的桌面程序包前, 仍需完成合规核查. 在核查完成前, 不对 copyleft 义务或分离分发作出结论.
