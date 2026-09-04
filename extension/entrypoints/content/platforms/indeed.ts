import type { PlatformAdapter, SyncResult } from "./base";
import { setNativeInputValue } from "./base";
import type { FullProfile } from "@/lib/types";

// Entirely unverified — no live DOM inspection was possible (Indeed's
// candidate resume/profile pages sit behind login). Hostname/path below are
// a best guess, not confirmed.
// TODO(you): confirm the real profile-edit URL and every selector below
// against your own logged-in account, then update this comment with the date.
// Last verified: never.
const SELECTORS = {
  nameField: "", // TODO
  headlineField: "", // TODO
};

export const indeedAdapter: PlatformAdapter = {
  platform: "indeed",

  isProfileEditPage: () =>
    window.location.hostname.endsWith("indeed.com") && window.location.pathname.includes("/resume"),

  isProfileViewPage: () =>
    window.location.hostname.endsWith("indeed.com") && window.location.pathname.includes("/profile"),

  async syncProfile(profile: FullProfile): Promise<SyncResult> {
    const fieldsUpdated: string[] = [];
    const errors: string[] = [];

    if (!SELECTORS.nameField || !SELECTORS.headlineField) {
      errors.push("Indeed selectors are unconfigured — see TODO in indeed.ts");
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
