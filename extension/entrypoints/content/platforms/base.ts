// Floating "Fill with Devcard" button injected into the page. Was
// previously shared across per-platform adapters too (Rule 4: adapters
// share zero state, but a UI affordance isn't state) — those adapters were
// dropped by request in favor of the generic AI field mapper being this
// content script's only fill mechanism, but the button itself is unchanged.
export function injectSyncButton(onClick: () => void, label = "🧠 Fill with Devcard"): HTMLButtonElement {
  const existing = document.getElementById("resync-sync-button");
  if (existing) existing.remove();

  const button = document.createElement("button");
  button.id = "resync-sync-button";
  button.textContent = label;
  Object.assign(button.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    zIndex: "2147483647",
    padding: "10px 16px",
    borderRadius: "9999px",
    border: "none",
    background: "#6366f1",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  } satisfies Partial<CSSStyleDeclaration>);

  button.addEventListener("click", onClick);
  document.body.appendChild(button);
  return button;
}

// Fills a form field the way the page's own framework expects: setting
// `.value` alone doesn't fire React/Angular's change detection, so we use
// the native setter + dispatch input/change events, same trick needed on
// every one of these platforms' JS-heavy edit forms.
export function setNativeInputValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}
