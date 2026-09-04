import { z } from "zod";

export const tailorResultSchema = z.object({
  summary: z.string(),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  suggestedProjects: z.array(z.string()),
});

export type TailorResult = z.infer<typeof tailorResultSchema>;

export const TAILOR_TOOL_NAME = "record_resume_tailoring";
export const TAILOR_TOOL_DESCRIPTION = "Records how to tailor this developer's resume to a specific job description.";

export const tailorJsonSchema = {
  type: "object" as const,
  properties: {
    summary: {
      type: "string",
      description:
        "A 2-4 sentence professional summary tailored to the job description, built only from real facts already in the profile — no invented achievements, metrics, or technologies.",
    },
    matchedSkills: {
      type: "array",
      items: { type: "string" },
      description:
        "Skill names copied exactly from the profile's real skills list, most relevant to this job first. Never a skill name that isn't literally in the profile.",
    },
    missingSkills: {
      type: "array",
      items: { type: "string" },
      description:
        "Skill names the job description (or required-skills text) asks for that are NOT in the profile's skills list. Only skills actually mentioned as required/preferred in the JD — don't guess at ones it doesn't mention.",
    },
    suggestedProjects: {
      type: "array",
      items: { type: "string" },
      description:
        "Project names copied exactly from the profile's real projects list, most relevant to this job first. Never a project name that isn't literally in the profile.",
    },
  },
  required: ["summary", "matchedSkills", "missingSkills", "suggestedProjects"],
};

export const TAILOR_SYSTEM_PROMPT = `You tailor a developer's resume to a specific job description — reordering and emphasizing what's real, never inventing what isn't.

You are given:
1. The developer's full profile as JSON (name, headline, bio, skills, experience, projects, education).
2. A job description (and optionally a separate list of specifically required skills).

Call ${TAILOR_TOOL_NAME} with:
- summary: a tailored professional summary (2-4 sentences) built ONLY from real profile facts — years of experience, real technologies, real achievements already in the profile. Emphasize what's relevant to this job. Never invent a metric, technology, or achievement that isn't already somewhere in the profile. If the profile has too little relevant experience for this job, say so honestly rather than overselling.
- matchedSkills: skill names that exist in the profile's real skills list, ordered by relevance to this job (most relevant first).
- missingSkills: skill names the job description or required-skills text asks for that are NOT in the profile's skills list.
- suggestedProjects: project names from the profile's real projects list, ordered by relevance to this job (most relevant first).

Every name in matchedSkills and suggestedProjects must be copied exactly from the profile's real lists — the server double-checks this and will silently correct anything that doesn't match, so get it right the first time rather than relying on that fallback.`;
