import type { FullProfile } from "../db/get-full-profile";
import type { resumeVersions } from "../db/schema";

type ResumeVersion = typeof resumeVersions.$inferSelect;

// Builds a resume-ready FullProfile — overlaying a saved version's
// tailoring onto the live profile when one is given, never mutating the DB,
// never touching the real skills/projects tables. Called unconditionally by
// every render path (with `version` undefined for a plain live-profile
// render), not just when a version exists — the "default to featured
// projects" behavior below needs to run in both cases, or a tailored
// version's own explicit projectNames curation (which may deliberately
// include a non-featured project for one specific job) would get silently
// re-filtered back down to just the featured ones by a template applying
// its own default on top. Resolving it once, here, is the only way both
// cases stay correct without every template needing to know the
// difference.
export function applyResumeVersion(full: FullProfile, version?: ResumeVersion): FullProfile {
  const merged: FullProfile = { ...full };

  if (version?.summary && full.profile) {
    merged.profile = { ...full.profile, bio: version.summary };
  }

  if (version?.skillNames) {
    const names: string[] = JSON.parse(version.skillNames);
    const byName = new Map(full.skills.map((s) => [s.name.toLowerCase(), s]));
    merged.skills = names.map((name, i) => {
      const existing = byName.get(name.toLowerCase());
      if (existing) return existing;
      return {
        id: `version-skill-${i}`,
        name,
        category: "tool",
        level: null,
        yearsOfExperience: null,
        addedAt: null,
      };
    });
  }

  if (version?.projectNames) {
    // Explicit curation from the version — respected exactly, even if it
    // includes a project that isn't flagged `featured` in the real table.
    const names: string[] = JSON.parse(version.projectNames);
    const byName = new Map(full.projects.map((p) => [p.name.toLowerCase(), p]));
    merged.projects = names.map((name) => byName.get(name.toLowerCase())).filter((p): p is FullProfile["projects"][number] => !!p);
  } else {
    // No explicit curation (no version, or a version that didn't set
    // projectNames) — default to featured projects; fall back to every
    // project if none are flagged, so a profile that hasn't set the flag
    // doesn't silently lose its projects.
    merged.projects = full.projects.some((p) => p.featured) ? full.projects.filter((p) => p.featured) : full.projects;
  }

  return merged;
}
