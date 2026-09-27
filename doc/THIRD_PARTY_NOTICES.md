---
name: project-third-party-notices
description: Third-party attribution and compliance notices
metadata:
  version: "1.0.0"
  lang: "en"
---

# Third-party notices

## Multi-language

**English** | [简体中文](zh-CN/THIRD_PARTY_NOTICES.md) | [繁體中文 (台灣)](zh-TW/THIRD_PARTY_NOTICES.md) | [繁體中文 (香港)](zh-HK/THIRD_PARTY_NOTICES.md) | [हिन्दी](hi/THIRD_PARTY_NOTICES.md) | [Español](es/THIRD_PARTY_NOTICES.md) | [العربية](ar/THIRD_PARTY_NOTICES.md) | [Français](fr/THIRD_PARTY_NOTICES.md)

## Documentation

- Project overview: [README](../README.md)

- Design rationale: [DESIGN](DESIGN.md)

- Release history: [LOG](LOG.md)

- Third-party notices: [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md)

## Third-Party-Notice

| Component / resource | Version / hash | Source | License | How used | Required attribution / notices | Release obligations | Verified on |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0xcaff/codex-web | Upstream baseline `0dfdc10` | [Upstream repository](https://github.com/0xcaff/codex-web) | `MIT` declared in `package.json`; complete license text absent from this checkout | Forked source | Preserve upstream attribution and confirm license text | Review before redistribution | 2026-09-27 |
| Codex desktop application | `26.901.41123` in `scripts/prepare` | URL recorded in `scripts/prepare` | Not established by this checkout | Extracted browser assets patched at build time | Review original notices and distribution terms | Review before distributing extracted assets or a hosted derivative | 2026-09-27 |
| npm dependencies | Exact package versions in `package-lock.json` | Package URLs in lockfile | Per-package; not inventoried in this document yet | Server and build dependencies | Review each package's notice and license text | Review before distributing bundled assets | 2026-09-27 |

## License texts and source provision

This checkout does not include the complete upstream license text or a verified inventory of the extracted desktop application's notices. `package-lock.json` records dependency versions but does not replace their license texts. The source for this fork is this repository; the upstream source is linked above. A release compliance review remains required before distributing a binary or extracted desktop bundle. No copyleft or separation conclusion is claimed without that review.
