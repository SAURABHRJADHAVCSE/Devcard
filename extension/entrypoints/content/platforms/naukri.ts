import type { PlatformAdapter, SyncResult } from "./base";
import { setNativeInputValue } from "./base";
import type { FullProfile } from "@/lib/types";

// Selectors below are carried over from the original project spec as a
// starting point — NOT verified against a live, logged-in naukri.com DOM.
// TODO(you): open naukri.com/mnjuser/profile while logged in, inspect each
// field with DevTools, and replace these. Once verified, update this
// comment with the date so the next person knows how stale it is.
// Last verified: never.
const SELECTORS = {
  nameField: "#rs-edudetails-fullname",
  headlineField: "#rs-prof-exp-designation",
  skillsSection: ".widgetHead",
};

export const naukriAdapter: PlatformAdapter = {
  platform: "naukri",

  isProfileEditPage: () =>
    window.location.hostname === "www.naukri.com" && window.location.pathname.includes("/mnjuser/profile"),

  isProfileViewPage: () =>
    window.location.hostname === "www.naukri.com" && !window.location.pathname.includes("profile"),

  async syncProfile(profile: FullProfile): Promise<SyncResult> {
    const fieldsUpdated: string[] = [];
    const errors: string[] = [];

    const nameEl = document.querySelector<HTMLInputElement>(SELECTORS.nameField);
    if (nameEl && profile.profile?.name) {
      setNativeInputValue(nameEl, profile.profile.name);
      fieldsUpdated.push("name");
    } else if (!nameEl) {
      errors.push(`Selector not found: nameField (${SELECTORS.nameField})`);
    }

    const headlineEl = document.querySelector<HTMLInputElement>(SELECTORS.headlineField);
    if (headlineEl && profile.profile?.headline) {
      setNativeInputValue(headlineEl, profile.profile.headline);
      fieldsUpdated.push("headline");
    } else if (!headlineEl) {
      errors.push(`Selector not found: headlineField (${SELECTORS.headlineField})`);
    }

    return { success: errors.length === 0, fieldsUpdated, errors };
  },
};
