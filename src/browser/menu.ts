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
  panels: Set<HTMLDivElement>;
  dismiss: () => void;
  timer: number;
} | null = null;

document.addEventListener("pointermove", (event) => {
  lastPointer = { x: event.clientX, y: event.clientY };
}, { passive: true });
document.addEventListener("pointerdown", (event) => {
  lastPointer = { x: event.clientX, y: event.clientY };
  if (activeMenu && ![...activeMenu.panels].some((panel) => panel.contains(event.target as Node))) {
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
  for (const panel of activeMenu.panels) panel.remove();
  activeMenu = null;
}

function makePanel(): HTMLDivElement {
  const panel = document.createElement("div");
  panel.setAttribute("role", "menu");
  Object.assign(panel.style, {
    boxSizing: "border-box",
    minWidth: "min(220px, calc(100vw - 16px))",
    maxWidth: "calc(100vw - 16px)",
    maxHeight: "calc(100vh - 16px)",
    overflowY: "auto",
    overflowX: "hidden",
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
  const panels = new Set<HTMLDivElement>([root]);
  const openSubmenus = new Map<number, { key: string; panel: HTMLDivElement }>();

  const closeSubmenus = (fromDepth: number) => {
    for (const [depth, open] of openSubmenus) {
      if (depth < fromDepth) continue;
      open.panel.remove();
      panels.delete(open.panel);
      openSubmenus.delete(depth);
    }
  };

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

      const showSubmenu = () => {
        const depth = path.length + 1;
        const key = [...path, index].join("/");
        if (openSubmenus.get(depth)?.key === key) return;
        closeSubmenus(depth);
        if (!item.submenu || !item.enabled) return;
        const submenu = makePanel();
        submenu.style.position = "fixed";
        submenu.style.zIndex = "2147483647";
        populate(submenu, item.submenu, [...path, index]);
        document.body.append(submenu);
        panels.add(submenu);
        openSubmenus.set(depth, { key, panel: submenu });
        const anchor = button.getBoundingClientRect();
        const right = anchor.right - 3;
        const left = anchor.left - submenu.offsetWidth + 3;
        const x = right + submenu.offsetWidth <= window.innerWidth - 8
          ? right
          : left >= 8 ? left : Math.max(8, window.innerWidth - submenu.offsetWidth - 8);
        const y = Math.max(8, Math.min(anchor.top - 5, window.innerHeight - submenu.offsetHeight - 8));
        submenu.style.left = `${x}px`;
        submenu.style.top = `${y}px`;
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
          openSubmenus.get(path.length + 1)?.panel.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
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
    panels,
    dismiss,
    timer: window.setTimeout(dismiss, 60_000),
  };
  root.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus({ preventScroll: true });
}

export function hideBrowserMenu(): void {
  closeMenu();
}
