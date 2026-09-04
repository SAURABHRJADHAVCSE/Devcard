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
  const realSkillNames = new Set(profile.skills.map((s) => s.name.toLowerCase()));
  const realProjectNames = new Set(profile.projects.map((p) => p.name.toLowerCase()));

  const matchedSkills: string[] = [];
  const missingSkills = [...parsed.data.missingSkills];
  for (const name of parsed.data.matchedSkills) {
    if (realSkillNames.has(name.toLowerCase())) {
      matchedSkills.push(name);
    } else if (!missingSkills.some((m) => m.toLowerCase() === name.toLowerCase())) {
      missingSkills.push(name);
    }
  }

  const suggestedProjects = parsed.data.suggestedProjects.filter((name) => realProjectNames.has(name.toLowerCase()));

  return { summary: parsed.data.summary, matchedSkills, missingSkills, suggestedProjects };
}
