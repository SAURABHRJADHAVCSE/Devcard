import type { PlatformAdapter, SyncResult } from "./base";
import type { FullProfile } from "@/lib/types";

// LinkedIn is the most brittle target: there's no separate profile-edit URL —
// editing happens through per-section modal dialogs opened from the profile
// view page (/in/<handle>/). A real sync here means: click each section's
// pencil icon, wait for its modal, fill it, save, close, repeat — which
// needs its own live-DOM investigation per section (headline, About,
// experience, skills are four different modals with four different forms).
// Entirely unverified — no live DOM inspection was possible (behind login).
// TODO(you): this adapter needs the most work of the four. Start with one
// section (e.g. headline) against your own live profile, verify the modal's
// selectors, and note the date you verified them here.
// Last verified: never.
const SELECTORS = {
  editIntroButton: "", // TODO: pencil icon that opens the headline/name modal
  headlineInput: "", // TODO: input inside that modal
};

export const linkedinAdapter: PlatformAdapter = {
  platform: "linkedin",

  isProfileEditPage: () =>
    window.location.hostname.endsWith("linkedin.com") && document.querySelector(".artdeco-modal") !== null,

  isProfileViewPage: () =>
    window.location.hostname.endsWith("linkedin.com") && window.location.pathname.startsWith("/in/"),

  async syncProfile(_profile: FullProfile): Promise<SyncResult> {
    return {
      success: false,
      fieldsUpdated: [],
      errors: [
        "LinkedIn adapter is unimplemented — its edit flow is modal-based, not a single form. See TODO in linkedin.ts.",
      ],
    };
  },
};
