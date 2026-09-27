#!/usr/bin/env python3
"""Apply hosted Web UI wording to the extracted Chinese locale bundle."""

from pathlib import Path


ASSETS = Path("scratch/asar/webview/assets")


def replace_once(path: Path, old: str, new: str) -> None:
    contents = path.read_text()
    count = contents.count(old)
    if count != 1:
        raise SystemExit(f"Expected one project label in {path}, found {count}")
    path.write_text(contents.replace(old, new, 1))


replace_once(
    ASSETS / "zh-CN-5bff6daefa6d.js",
    '"projectSetup.createProject.localLabel":`本地`',
    '"projectSetup.createProject.localLabel":`此服务器`',
)
replace_once(
    ASSETS / "zh-CN-5bff6daefa6d.js",
    '"projectSetup.createProject.localDescription":`在你的电脑上编辑、运行和测试文件`',
    '"projectSetup.createProject.localDescription":`在此服务器上编辑、运行和测试文件`',
)
replace_once(
    ASSETS / "zh-CN-5bff6daefa6d.js",
    '"imageAttachment.removeAriaLabel":`移除“{filename}”`,',
    '"imageAttachment.removeAriaLabel":`移除“{filename}”`,"imageAttachment.removeImage":`移除图片`,',
)
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
