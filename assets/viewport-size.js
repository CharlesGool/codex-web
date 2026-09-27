(() => {
  const root = document.documentElement;
  const viewport = window.visualViewport;

  function updateViewportSize() {
    const height = viewport?.height ?? window.innerHeight;
    const top = viewport?.offsetTop ?? 0;
    if (Number.isFinite(height) && height > 0) {
      root.style.setProperty("--codex-web-viewport-height", `${height}px`);
    }
    root.style.setProperty("--codex-web-viewport-top", `${Math.max(0, top)}px`);
  }

  let pendingFrame = 0;
  function scheduleUpdate() {
    if (pendingFrame) cancelAnimationFrame(pendingFrame);
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = 0;
      updateViewportSize();
    });
  }

  updateViewportSize();
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("orientationchange", () => {
    scheduleUpdate();
    setTimeout(updateViewportSize, 250);
  });
  window.addEventListener("pageshow", scheduleUpdate);
  viewport?.addEventListener("resize", scheduleUpdate);
  viewport?.addEventListener("scroll", scheduleUpdate);
})();
