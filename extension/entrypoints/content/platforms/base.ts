import type { FullProfile } from "@/lib/types";

export interface SyncResult {
  success: boolean;
  fieldsUpdated: string[];
  errors: string[];
}

export interface PlatformAdapter {
  // Unique identifier used in sync-status tracking (matches the :platform
  // param in POST /api/sync-status/:platform).
  platform: string;

  // True if the current URL is a profile edit page for this platform.
  isProfileEditPage(): boolean;

  // True if the current URL is a profile view page (to show an "Edit" prompt).
  isProfileViewPage(): boolean;

  // Given the full profile, fill in the current page's form fields.
  syncProfile(profile: FullProfile): Promise<SyncResult>;
}

// Floating "Sync with Devcard" button injected on a platform's edit page.
// Shared across adapters so every platform gets identical placement/styling
// (Rule 4: adapters share zero state, but a UI affordance isn't state).
export function injectSyncButton(onClick: () => void, label = "🧠 Sync with Devcard"): HTMLButtonElement {
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
