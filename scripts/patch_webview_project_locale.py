#!/usr/bin/env python3
"""Apply hosted Web UI wording to the extracted Chinese locale bundle."""

from pathlib import Path
import re


ASSETS = Path("scratch/asar/webview/assets")


def replace_once(path: Path, old: str, new: str) -> None:
    contents = path.read_text()
    count = contents.count(old)
    if count != 1:
        raise SystemExit(f"Expected one project label in {path}, found {count}")
    path.write_text(contents.replace(old, new, 1))


def replace_locale(key: str, old_value: str, new_value: str, extra: str = "") -> None:
    path = ASSETS / "zh-CN-5bff6daefa6d.js"
    contents = path.read_text()
    pattern = re.compile(rf'("{re.escape(key)}"\s*:\s*)`{re.escape(old_value)}`(,?)')
    matches = list(pattern.finditer(contents))
    if len(matches) != 1:
        raise SystemExit(f"Expected one locale entry for {key} in {path}, found {len(matches)}")
    match = matches[0]
    replacement = f"{match.group(1)}`{new_value}`{match.group(2)}{extra}"
    path.write_text(contents[:match.start()] + replacement + contents[match.end():])


replace_locale("projectSetup.createProject.localLabel", "本地", "此服务器")
replace_locale("projectSetup.createProject.localDescription", "在你的电脑上编辑、运行和测试文件", "在此服务器上编辑、运行和测试文件")
replace_locale("imageAttachment.removeAriaLabel", "移除“{filename}”", "移除“{filename}”", '"imageAttachment.removeImage":`移除图片`,')
replace_locale("imageAttachment.removeImage", "移除图片", "移除图片", '"codexWeb.trustedIps.title":`IP 白名单`,"codexWeb.trustedIps.description":`列表中的内网 IP 无需密码即可打开面板。保存后立即生效。`,"codexWeb.trustedIps.current":`当前连接：`,"codexWeb.trustedIps.loading":`加载中…`,"codexWeb.trustedIps.thisDevice":`此设备`,"codexWeb.trustedIps.remove":`移除`,"codexWeb.trustedIps.empty":`暂无可信 IP`,"codexWeb.trustedIps.input":`IP 地址`,"codexWeb.trustedIps.add":`添加 IP`,"codexWeb.trustedIps.saving":`保存中…`,"codexWeb.trustedIps.save":`保存更改`,"codexWeb.trustedIps.saved":`IP 白名单已保存`,"codexWeb.trustedIps.currentRemoved":`保存后，此设备下次访问需要输入账号和密码。`,"codexWeb.trustedIps.invalid":`请输入内网或回环 IPv4 地址`,"codexWeb.trustedIps.duplicate":`此 IP 已在列表中`,"codexWeb.trustedIps.limit":`白名单最多包含 128 个地址`,"codexWeb.trustedIps.loadError":`无法加载 IP 白名单`,"codexWeb.trustedIps.saveError":`无法保存 IP 白名单`,')
replace_locale("threadHeader.openInNewWindow", "在新窗口中打开", "在新标签页中打开", '"codexWeb.chatHistoryUnavailable":`此网站不支持同步 ChatGPT 网页或手机中的聊天记录。`,"codexWeb.help.changelog":`更新日志`,')
replace_once(
    ASSETS / "app-primary-6b28e06666ff.js",
    'id: `projectSetup.createProject.localLabel`,\n              defaultMessage: `Local`',
    'id: `projectSetup.createProject.localLabel`,\n              defaultMessage: `This server`',
)
replace_once(
    ASSETS / "app-primary-6b28e06666ff.js",
    'id: `projectSetup.createProject.localDescription`,\n              defaultMessage: `Edit, run, and test files on your computer`',
    'id: `projectSetup.createProject.localDescription`,\n              defaultMessage: `Edit, run, and test files on this server`',
)
