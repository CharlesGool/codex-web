#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
runtime_bin="${CODEX_WEB_NODE_BIN_DIR:-$project_dir/node/bin}"
if [[ -x "$runtime_bin/node" ]]; then
  export PATH="$runtime_bin:$PATH"
fi
export CODEX_CLI_PATH="${CODEX_CLI_PATH:-$(command -v codex)}"

# The desktop bundle uses Git even for some panel and terminal state. A user
# service may have a smaller PATH than an interactive shell on this host.
if ! command -v git >/dev/null 2>&1; then
  git_bin_dir="${CODEX_WEB_GIT_BIN_DIR:-$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback}"
  if [[ -x "$git_bin_dir/git" ]]; then
    export PATH="$git_bin_dir:$PATH"
  fi
fi
if ! command -v git >/dev/null 2>&1; then
  echo "codex-web requires Git in PATH; set CODEX_WEB_GIT_BIN_DIR to its bin directory" >&2
  exit 1
fi

cd "$project_dir"
exec node src/server/main.js "$@"
