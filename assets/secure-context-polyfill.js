// randomUUID is restricted to secure contexts, but getRandomValues also works
// when the app is served to trusted devices over LAN HTTP.
if (typeof crypto.randomUUID !== "function") {
  crypto.randomUUID = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  };
}

// Clipboard.writeText is unavailable on LAN HTTP origins. The copy command
// still works when it runs synchronously inside the user's click handler.
if (!navigator.clipboard?.writeText) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText(text) {
        const field = document.createElement("textarea");
        const focused = document.activeElement;
        field.value = String(text);
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        field.style.pointerEvents = "none";
        document.body.appendChild(field);
        field.focus();
        field.select();
        let copied = false;
        try {
          copied = document.execCommand("copy");
        } finally {
          field.remove();
          if (focused instanceof HTMLElement) focused.focus();
        }
        return copied
          ? Promise.resolve()
          : Promise.reject(new Error("Copying to the clipboard failed"));
      },
    },
  });
}
