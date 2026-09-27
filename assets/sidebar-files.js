(() => {
  if (!document.getElementById("codex-web-file-view-style")) {
    const style = document.createElement("style");
    style.id = "codex-web-file-view-style";
    style.textContent = `
      .codex-web-file-view > .codex-web-file-tree {
        flex: 0 0 clamp(180px, 33%, 340px);
        max-width: 48%;
        min-height: 0;
        border-right: 1px solid var(--color-border, #e5e5e5);
      }
      .codex-web-file-tree > .relative.flex.h-full.shrink-0 {
        width: 100% !important;
        max-width: none !important;
        border-left: 0;
      }
      .codex-web-file-tree [role="separator"] { display: none; }
      .codex-web-file-view > .min-w-0.flex-1 { min-width: 0; }
      div.flex.min-h-0.flex-1:has(> div.relative.flex.h-full.shrink-0 file-tree-container)
        > div.relative.flex.h-full.shrink-0 {
        order: -1;
        width: clamp(180px, 33%, 340px) !important;
        max-width: 48% !important;
        border-left: 0;
        border-right: 1px solid var(--color-border, #e5e5e5);
      }
      div.flex.min-h-0.flex-1:has(> div.relative.flex.h-full.shrink-0 file-tree-container)
        > div.relative.flex.h-full.shrink-0 [role="separator"] { display: none; }
    `;
    document.head.append(style);
  }

  // The desktop tab exit animation occasionally stalls at a few pixels wide
  // in a browser. Hide only tabs that remain collapsed after the animation's
  // normal lifetime; a live tab has a minimum width of 90px.
  const observedTabs = new WeakSet();
  const collapsedTimers = new WeakMap();
  const tabSizes = new ResizeObserver((entries) => {
    for (const { target } of entries) {
      const tab = target;
      clearTimeout(collapsedTimers.get(tab));
      if (tab.dataset.codexWebHiddenCollapsed === "1") {
        if (tab.querySelector('[role="tab"][aria-selected="true"]')) {
          tab.style.display = "";
          delete tab.dataset.codexWebHiddenCollapsed;
        }
        continue;
      }
      if (tab.getBoundingClientRect().width >= 70) continue;
      collapsedTimers.set(tab, setTimeout(() => {
        if (!tab.isConnected || tab.getBoundingClientRect().width >= 70 ||
            tab.querySelector('[role="tab"][aria-selected="true"]')) return;
        tab.dataset.codexWebHiddenCollapsed = "1";
        tab.style.display = "none";
      }, 800));
    }
  });
  function observeTabs() {
    for (const tab of document.querySelectorAll(
      '[data-app-shell-tab-strip-controller="right"] [data-app-shell-tab-controller="right"]'
    )) {
      if (!observedTabs.has(tab)) {
        observedTabs.add(tab);
        tabSizes.observe(tab);
      }
      if (tab.dataset.codexWebHiddenCollapsed === "1" &&
          tab.querySelector('[role="tab"][aria-selected="true"]')) {
        tab.style.display = "";
        delete tab.dataset.codexWebHiddenCollapsed;
      }
    }
  }

  // Keep the active file tab visible after a close changes strip width.
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const closeButton = target.closest("[data-app-shell-tab-close-button]");
    if (!closeButton?.closest('[data-tab-id^="file:"]')) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const strip = document.querySelector('[data-app-shell-tab-strip-controller="right"]');
      if (!(strip instanceof HTMLElement)) return;
      if (strip.scrollWidth <= strip.clientWidth + 1) {
        strip.scrollLeft = 0;
        return;
      }
      const activeTab = strip.querySelector('[role="tab"][aria-selected="true"]');
      if (!(activeTab instanceof HTMLElement)) return;
      const stripRect = strip.getBoundingClientRect();
      const activeRect = activeTab.getBoundingClientRect();
      if (activeRect.left < stripRect.left) {
        strip.scrollLeft += activeRect.left - stripRect.left - 8;
      } else if (activeRect.right > stripRect.right) {
        strip.scrollLeft += activeRect.right - stripRect.right + 8;
      }
    }));
  }, true);

  function mountFilesEntry() {
    const root = document.getElementById("root");
    if (!root) return;
    const newChat = Array.from(root.querySelectorAll("button.sidebar-item")).find((button) => {
      const label = button.querySelector("span.text-fade-truncate")?.textContent?.trim();
      return label === "新对话" || label === "New chat";
    });
    if (!newChat || newChat.parentElement?.querySelector(".codex-web-sidebar-files")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = `${newChat.className} codex-web-sidebar-files`;
    button.setAttribute("aria-label", "文件");
    button.innerHTML = '<div class="flex min-w-0 items-center text-base gap-2 browser:gap-1.5 flex-1 text-default"><span class="flex icon-leading-slot w-4 shrink-0 items-center justify-center browser:w-5"><svg aria-hidden="true" class="icon-xs browser:icon-base" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1.75 4.25A1.5 1.5 0 0 1 3.25 2.75h3.1l1.4 1.5h5A1.5 1.5 0 0 1 14.25 5.75v6A1.5 1.5 0 0 1 12.75 13.25h-9A2 2 0 0 1 1.75 11.25v-7Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg></span><span class="text-fade-truncate">文件</span></div>';
    button.addEventListener("click", async () => {
      if (typeof window.codexWebOpenFiles !== "function") {
        const toggle = Array.from(document.querySelectorAll("button[aria-label]"))
          .find((item) => item.getAttribute("aria-label") === "显示/隐藏侧边面板" ||
            item.getAttribute("aria-label") === "Toggle side panel");
        toggle?.click();
        for (let attempt = 0; attempt < 20 && typeof window.codexWebOpenFiles !== "function"; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
      if (typeof window.codexWebOpenFiles === "function") {
        window.codexWebOpenFiles();
      } else {
        alert("请先打开一个对话，再点击“文件”。");
      }
    });
    newChat.after(button);
  }

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; mountFilesEntry(); observeTabs(); });
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-selected"],
  });
  mountFilesEntry();
  observeTabs();
})();
