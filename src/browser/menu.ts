type MenuItem = {
  checked: boolean;
  enabled: boolean;
  label: string;
  submenu?: MenuItem[];
  type: string;
};

type MenuPayload = { menuId: string; items: MenuItem[] };

let lastPointer = { x: 24, y: 60 };
let activeMenu: {
  element: HTMLDivElement;
  dismiss: () => void;
  timer: number;
} | null = null;

document.addEventListener("pointermove", (event) => {
  lastPointer = { x: event.clientX, y: event.clientY };
}, { passive: true });
document.addEventListener("pointerdown", (event) => {
  lastPointer = { x: event.clientX, y: event.clientY };
  if (activeMenu && !activeMenu.element.contains(event.target as Node)) {
    activeMenu.dismiss();
  }
}, true);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && activeMenu) {
    event.preventDefault();
    activeMenu.dismiss();
  }
});

function closeMenu(): void {
  if (!activeMenu) return;
  window.clearTimeout(activeMenu.timer);
  activeMenu.element.remove();
  activeMenu = null;
}

function makePanel(): HTMLDivElement {
  const panel = document.createElement("div");
  panel.setAttribute("role", "menu");
  Object.assign(panel.style, {
    boxSizing: "border-box",
    minWidth: "220px",
    maxWidth: "min(300px, calc(100vw - 16px))",
    maxHeight: "calc(100vh - 16px)",
    overflowY: "auto",
    padding: "5px",
    border: "1px solid color-mix(in srgb, CanvasText 18%, transparent)",
    borderRadius: "10px",
    background: "Canvas",
    color: "CanvasText",
    boxShadow: "0 10px 30px #0003",
    font: "13px system-ui, sans-serif",
  });
  panel.addEventListener("pointerdown", (event) => event.stopPropagation());
  panel.addEventListener("click", (event) => event.stopPropagation());
  return panel;
}

export function showBrowserMenu(
  payload: MenuPayload,
  sendSelection: (menuId: string, path: number[]) => void,
  sendDismissal: (menuId: string) => void,
): void {
  if (!payload || typeof payload.menuId !== "string" || !Array.isArray(payload.items)) return;
  activeMenu?.dismiss();

  const root = makePanel();
  root.dataset.codexWebMenu = payload.menuId;
  root.style.position = "fixed";
  root.style.zIndex = "2147483647";
  document.body.append(root);

  const select = (path: number[]) => {
    closeMenu();
    sendSelection(payload.menuId, path);
  };
  const dismiss = () => {
    closeMenu();
    sendDismissal(payload.menuId);
  };

  function populate(panel: HTMLDivElement, items: MenuItem[], path: number[]): void {
    for (const [index, item] of items.entries()) {
      if (item.type === "separator") {
        const separator = document.createElement("div");
        separator.setAttribute("role", "separator");
        Object.assign(separator.style, {
          height: "1px",
          margin: "5px 3px",
          background: "color-mix(in srgb, CanvasText 15%, transparent)",
        });
        panel.append(separator);
        continue;
      }

      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "menuitem");
      button.disabled = !item.enabled;
      button.tabIndex = -1;
      button.setAttribute("aria-label", item.label);
      if (item.submenu) button.setAttribute("aria-haspopup", "menu");
      Object.assign(button.style, {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        width: "100%",
        minHeight: "31px",
        padding: "5px 10px",
        border: "0",
        borderRadius: "6px",
        background: "transparent",
        color: "inherit",
        textAlign: "left",
        font: "inherit",
        cursor: item.enabled ? "pointer" : "default",
        opacity: item.enabled ? "1" : "0.45",
      });
      const check = document.createElement("span");
      check.textContent = item.checked ? "✓" : "";
      check.style.width = "14px";
      button.append(check);
      const label = document.createElement("span");
      label.textContent = item.label;
      label.style.flex = "1";
      button.append(label);
      if (item.submenu) {
        const arrow = document.createElement("span");
        arrow.textContent = "›";
        button.append(arrow);
      }
      wrapper.append(button);
      panel.append(wrapper);

      let submenu: HTMLDivElement | null = null;
      const showSubmenu = () => {
        for (const sibling of panel.querySelectorAll(":scope > div > [role=menu]")) {
          (sibling as HTMLElement).style.display = "none";
        }
        if (!item.submenu || !item.enabled) return;
        if (!submenu) {
          submenu = makePanel();
          submenu.style.position = "absolute";
          submenu.style.top = "-5px";
          submenu.style.left = "calc(100% - 3px)";
          populate(submenu, item.submenu, [...path, index]);
          wrapper.append(submenu);
        }
        submenu.style.display = "block";
        if (submenu.getBoundingClientRect().right > window.innerWidth - 8) {
          submenu.style.left = "auto";
          submenu.style.right = "calc(100% - 3px)";
        }
      };
      wrapper.addEventListener("pointerenter", showSubmenu);
      button.addEventListener("focus", showSubmenu);
      button.addEventListener("pointerenter", () => {
        if (item.enabled) button.style.background = "color-mix(in srgb, CanvasText 9%, Canvas)";
      });
      button.addEventListener("pointerleave", () => { button.style.background = "transparent"; });
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!item.enabled) return;
        if (item.submenu) {
          showSubmenu();
          submenu?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
        } else {
          select([...path, index]);
        }
      });
    }
  }

  populate(root, payload.items, []);
  root.style.left = `${Math.max(8, Math.min(lastPointer.x, window.innerWidth - root.offsetWidth - 8))}px`;
  root.style.top = `${Math.max(8, Math.min(lastPointer.y, window.innerHeight - root.offsetHeight - 8))}px`;
  activeMenu = {
    element: root,
    dismiss,
    timer: window.setTimeout(dismiss, 60_000),
  };
  root.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus({ preventScroll: true });
}

export function hideBrowserMenu(): void {
  closeMenu();
}
