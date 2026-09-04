import type { FullProfile } from "../db/get-full-profile";
import type { resumeVersions } from "../db/schema";

type ResumeVersion = typeof resumeVersions.$inferSelect;

// Builds a resume-ready FullProfile by overlaying a saved version's
// tailoring onto the live profile — never mutates the DB, never touches the
// real skills/projects tables. A skillName in the version that isn't in the
// real skills table (a JD-required skill the user approved for this resume
// only, see ai/tailor-resume.ts) is synthesized as a minimal skill row
// purely for rendering; it was never written to the knowledge base and
// won't show up anywhere else. Fields left unset on the version (null) fall
// through to whatever the live profile currently says — a version doesn't
// freeze the profile, it only overrides what it explicitly chose to.
export function applyResumeVersion(full: FullProfile, version: ResumeVersion): FullProfile {
  const merged: FullProfile = { ...full };

  if (version.summary && full.profile) {
    merged.profile = { ...full.profile, bio: version.summary };
  }

  if (version.skillNames) {
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

  if (version.projectNames) {
    const names: string[] = JSON.parse(version.projectNames);
    const byName = new Map(full.projects.map((p) => [p.name.toLowerCase(), p]));
    merged.projects = names.map((name) => byName.get(name.toLowerCase())).filter((p): p is FullProfile["projects"][number] => !!p);
  }

  return merged;
}
