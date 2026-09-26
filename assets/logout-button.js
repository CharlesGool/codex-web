(() => {
  const style = document.createElement("style");
  style.textContent = `
    .codex-web-logout-button {
      flex: none;
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: inherit;
      cursor: pointer;
      font: inherit;
      font-size: 14px;
      padding: 6px 8px;
      white-space: nowrap;
    }
    .codex-web-logout-button:hover { background: rgba(127, 127, 127, .12); }
    .codex-web-logout-button:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
    .codex-web-logout-button:disabled { cursor: default; opacity: .5; }
  `;
  document.head.appendChild(style);

  function mountLogoutButton() {
    const root = document.getElementById("root");
    if (!root) return;
    const profileButton = Array.from(
      root.querySelectorAll('div.h-toolbar button[aria-haspopup="menu"]'),
    ).find((button) => button.querySelector("span.truncate"));
    const row = profileButton?.closest("div.h-toolbar");
    const actions = row?.lastElementChild;
    if (!actions || actions.querySelector(".codex-web-logout-button")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "codex-web-logout-button";
    button.textContent = "退出登录";
    button.setAttribute("aria-label", "退出登录");
    button.addEventListener("click", async (event) => {
      event.stopPropagation();
      button.disabled = true;
      button.textContent = "正在退出…";
      try {
        const response = await fetch("/__auth/logout", {
          method: "POST",
          credentials: "same-origin",
        });
        if (!response.ok && response.status !== 401) throw new Error("Logout failed");
        window.location.replace("/login");
      } catch {
        button.textContent = "退出失败，重试";
        button.disabled = false;
      }
    });
    actions.prepend(button);
  }

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      mountLogoutButton();
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  mountLogoutButton();
})();
