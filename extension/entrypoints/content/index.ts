import { injectSyncButton } from "./platforms/base";
import { fillWithDevcard, hasFillableFields } from "./platforms/generic";
import { markSynced } from "@/lib/api";

// Every platform-specific adapter (LinkedIn, Naukri, Indeed, Wellfound) was
// dropped by explicit request — hardcoded CSS-selector adapters need manual
// DOM inspection per site (and drift whenever a site redesigns), while the
// generic AI field mapper below already handles any page, no selectors
// needed, at the cost of one small AI call per fill. This hostname list is
// NOT a selector adapter — it's kept only so the Sync status tab still
// means something for the sites you're most likely to actually apply
// through, by marking them synced after a successful generic-mapper fill.
const KNOWN_JOB_PLATFORMS: Record<string, string> = {
  "www.naukri.com": "naukri",
  "www.indeed.com": "indeed",
  "indeed.com": "indeed",
  "wellfound.com": "wellfound",
};

async function handleFillClick() {
  const result = await fillWithDevcard();
  window.alert(
    result.filled > 0
      ? `Filled ${result.filled} of ${result.total} field(s).`
      : "Couldn't confidently map any fields on this page.",
  );

  const platform = KNOWN_JOB_PLATFORMS[window.location.hostname];
  if (platform && result.filled > 0) await markSynced(platform);
}

export default defineContentScript({
  // <all_urls> is a real permission expansion, not an accident — the
  // generic mapper needs to run anywhere a fillable form might exist. The
  // script only *acts* where hasFillableFields() finds something worth
  // filling.
  matches: ["<all_urls>"],
  main() {
    if (hasFillableFields()) {
      injectSyncButton(handleFillClick, "🧠 Fill with Devcard");
    }
  },
});
