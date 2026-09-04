import type { PlatformAdapter } from "./platforms/base";
import { injectSyncButton } from "./platforms/base";
import { naukriAdapter } from "./platforms/naukri";
import { indeedAdapter } from "./platforms/indeed";
import { wellfoundAdapter } from "./platforms/wellfound";
import { linkedinAdapter } from "./platforms/linkedin";
import { fillWithDevcard, hasFillableFields } from "./platforms/generic";
import { getProfile, markSynced } from "@/lib/api";

// Hostname -> adapter. Each adapter is fully isolated (Rule 4) — this map
// is the only place that knows all of them at once.
const ADAPTERS: Record<string, PlatformAdapter> = {
  "www.naukri.com": naukriAdapter,
  "www.indeed.com": indeedAdapter,
  "indeed.com": indeedAdapter,
  "wellfound.com": wellfoundAdapter,
  "www.linkedin.com": linkedinAdapter,
  "linkedin.com": linkedinAdapter,
};

function getAdapter(): PlatformAdapter | undefined {
  return ADAPTERS[window.location.hostname];
}

async function handleSyncClick(adapter: PlatformAdapter) {
  const profile = await getProfile();
  const result = await adapter.syncProfile(profile);

  if (result.success) {
    await markSynced(adapter.platform);
  }

  const summary = result.success
    ? `Synced: ${result.fieldsUpdated.join(", ") || "(nothing to update)"}`
    : `Sync failed:\n${result.errors.join("\n")}`;
  // A native alert is the simplest thing that works uniformly across every
  // host page's CSS — a custom toast would risk being swallowed by the
  // page's own styles.
  window.alert(summary);
}

async function handleFillClick() {
  const result = await fillWithDevcard();
  window.alert(
    result.filled > 0
      ? `Filled ${result.filled} of ${result.total} field(s).`
      : "Couldn't confidently map any fields on this page.",
  );
}

export default defineContentScript({
  // Phase 4 (generic mapper) needs to run on any page, not just the four
  // known platforms — that's a real permission expansion (<all_urls>), not
  // an accident. The script itself only *acts* where isProfileEditPage()
  // or hasFillableFields() says there's something to do.
  matches: ["<all_urls>"],
  main() {
    const adapter = getAdapter();

    if (adapter) {
      if (adapter.isProfileEditPage()) {
        injectSyncButton(() => handleSyncClick(adapter));
      }
      // isProfileViewPage() is reserved for a future "Edit your profile to
      // sync" nudge — not wired up yet, deliberately.
      return;
    }

    // Unknown platform: offer the generic AI field mapper instead, but only
    // where there's actually something on the page worth filling.
    if (hasFillableFields()) {
      injectSyncButton(handleFillClick, "🧠 Fill with Devcard");
    }
  },
});
