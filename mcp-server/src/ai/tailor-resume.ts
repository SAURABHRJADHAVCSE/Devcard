import {
  tailorResultSchema,
  tailorJsonSchema,
  TAILOR_TOOL_NAME,
  TAILOR_TOOL_DESCRIPTION,
  TAILOR_SYSTEM_PROMPT,
  type TailorResult,
} from "./tailor-schema";
import { getProvider } from "./provider";
import { getFullProfile } from "../db/get-full-profile";

// A resume-appropriate skills section is curated, not exhaustive — capped
// here as a safety net regardless of whether the model followed the prompt's
// own "at most 18" instruction. Skills past the cap are still real and still
// true of the person; they just don't get featured on this one-page resume.
const MAX_MATCHED_SKILLS = 18;
const MAX_SUMMARY_LENGTH = 500;
// Matches the profile's own "featured" project default (see
// pdf/tailor.ts::applyResumeVersion) — that default was already verified to
// fit one page; a version's explicit projectNames is respected exactly, so
// nothing else caps it if the model suggests more than the profile's own
// default would show. Found via a real page-fit regression: two saved
// versions with a correctly-capped 500-char summary and 18 skills still
// rendered 2 pages because suggestedProjects had 3 entries instead of 2 —
// the missing cap here, not the summary/skills logic, was the actual cause.
const MAX_SUGGESTED_PROJECTS = 2;

function uniqueNonEmpty(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    const key = trimmed.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

function limitSummary(summary: string): string {
  const clean = summary.trim();
  if (clean.length <= MAX_SUMMARY_LENGTH) return clean;
  const shortened = clean.slice(0, MAX_SUMMARY_LENGTH - 1);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > 420 ? lastSpace : shortened.length).replace(/[,:;\s]+$/, "")}.`;
}

// Analysis only — never writes to the database. matchedSkills/
// suggestedProjects/missingSkills are a *proposal*; nothing is saved as a
// resume version until the caller (dashboard form, or Claude after asking
// the user about missingSkills) explicitly calls save_resume_version.
export async function tailorResume(jobDescription: string, requiredSkills?: string): Promise<TailorResult> {
  const profile = await getFullProfile();
  const provider = getProvider();

  const userMessage = JSON.stringify({ profile, jobDescription, requiredSkills });
  const raw = await provider.callTool({
    system: TAILOR_SYSTEM_PROMPT,
    userMessage,
    toolName: TAILOR_TOOL_NAME,
    toolDescription: TAILOR_TOOL_DESCRIPTION,
    jsonSchema: tailorJsonSchema,
  });

  const parsed = tailorResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("AI tailoring response didn't match the expected shape");
  }

  // Trust but verify: a "matched" skill or "suggested" project the model
  // hallucinated (despite instructions) never silently reaches the caller
  // labeled as real. Anything not actually in the profile gets demoted to
  // missingSkills instead — which requires explicit user approval before
  // ever being saved onto a resume — rather than presented as already true.
  // Real projects that don't match get dropped rather than demoted: there's
  // no "missing project" concept to approve into, unlike skills.
  const realSkillNames = new Map(profile.skills.map((s) => [s.name.toLowerCase(), s.name]));
  const realProjectNames = new Map(profile.projects.map((p) => [p.name.toLowerCase(), p.name]));

  const matchedSkills: string[] = [];
  const missingSkills = uniqueNonEmpty(parsed.data.missingSkills).filter((name) => !realSkillNames.has(name.toLowerCase()));
  for (const name of parsed.data.matchedSkills) {
    const canonicalName = realSkillNames.get(name.toLowerCase());
    if (canonicalName) {
      matchedSkills.push(canonicalName);
    } else if (!missingSkills.some((m) => m.toLowerCase() === name.toLowerCase())) {
      missingSkills.push(name.trim());
    }
  }

  const suggestedProjects = uniqueNonEmpty(parsed.data.suggestedProjects)
    .map((name) => realProjectNames.get(name.toLowerCase()))
    .filter((name): name is string => Boolean(name))
    .slice(0, MAX_SUGGESTED_PROJECTS);

  // A 90+ estimate is not credible while the JD still contains known skill
  // gaps. This server-side ceiling prevents any provider from inflating the
  // score merely because the caller asked for a particular number.
  const gapScoreCeiling = missingSkills.length === 0 ? 100 : missingSkills.length <= 2 ? 89 : missingSkills.length <= 4 ? 84 : 79;
  const estimatedMatchScore = Math.min(parsed.data.estimatedMatchScore, gapScoreCeiling);
  const atsWarnings = uniqueNonEmpty(parsed.data.atsWarnings);
  if (estimatedMatchScore < parsed.data.estimatedMatchScore) {
    atsWarnings.unshift(
      `Estimated score capped at ${gapScoreCeiling} because ${missingSkills.length} JD skill gap${missingSkills.length === 1 ? " remains" : "s remain"}.`,
    );
  }

  return {
    summary: limitSummary(parsed.data.summary),
    matchedSkills: uniqueNonEmpty(matchedSkills).slice(0, MAX_MATCHED_SKILLS),
    missingSkills,
    suggestedProjects,
    estimatedMatchScore,
    scoreRationale: uniqueNonEmpty(parsed.data.scoreRationale).slice(0, 5),
    atsWarnings: atsWarnings.slice(0, 6),
  };
}
