import type { PlatformAdapter, SyncResult } from "./base";
import { setNativeInputValue } from "./base";
import type { FullProfile } from "@/lib/types";

// Entirely unverified — no live DOM inspection was possible (Wellfound's
// profile-edit page sits behind login). Path below is a best guess.
// TODO(you): confirm the real profile-edit URL and every selector below
// against your own logged-in account, then update this comment with the date.
// Last verified: never.
const SELECTORS = {
  nameField: "", // TODO
  headlineField: "", // TODO
};

export const wellfoundAdapter: PlatformAdapter = {
  platform: "wellfound",

  isProfileEditPage: () =>
    window.location.hostname === "wellfound.com" && window.location.pathname.startsWith("/profile/edit"),

  isProfileViewPage: () =>
    window.location.hostname === "wellfound.com" && window.location.pathname.startsWith("/u/"),

  async syncProfile(profile: FullProfile): Promise<SyncResult> {
    const fieldsUpdated: string[] = [];
    const errors: string[] = [];

    if (!SELECTORS.nameField || !SELECTORS.headlineField) {
      errors.push("Wellfound selectors are unconfigured — see TODO in wellfound.ts");
      return { success: false, fieldsUpdated, errors };
    }

    const nameEl = document.querySelector<HTMLInputElement>(SELECTORS.nameField);
    if (nameEl && profile.profile?.name) {
      setNativeInputValue(nameEl, profile.profile.name);
      fieldsUpdated.push("name");
    } else if (!nameEl) {
      errors.push(`Selector not found: nameField (${SELECTORS.nameField})`);
    }

    return { success: errors.length === 0, fieldsUpdated, errors };
  },
};
