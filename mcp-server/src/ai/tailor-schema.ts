import { z } from "zod";

export const tailorResultSchema = z.object({
  summary: z.string(),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  suggestedProjects: z.array(z.string()),
  estimatedMatchScore: z.number().int().min(0).max(100),
  scoreRationale: z.array(z.string()).max(5),
  atsWarnings: z.array(z.string()).max(6),
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
        "A professional summary tailored to the job description, built only from real facts already in the profile — no invented achievements, metrics, or technologies. Hard limit: under 500 characters total (roughly 2-3 sentences) — this has to fit in a few lines at the top of a one-page resume, not a paragraph. Lead with the single most relevant, most impressive true fact rather than burying it; write in confident active voice (\"Built\", \"Led\", \"Reduced\" — never \"Was responsible for\" or \"Helped with\"); keep every sentence concrete and specific, never generic filler (\"hardworking team player\", \"passionate about technology\").",
    },
    matchedSkills: {
      type: "array",
      items: { type: "string" },
      description:
        "At most 18 skill names copied exactly from the profile's real skills list, most relevant to this job first. This becomes the resume's one-page skills section, not an exhaustive dump — if more than 18 real skills match, pick the 18 most relevant to this specific job and leave the rest out (the profile still has them; this is just what's shown on this tailored resume). Never a skill name that isn't literally in the profile.",
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
        "At most 2 project names copied exactly from the profile's real projects list, most relevant to this job first. This is a one-page resume's featured-projects section, not every project the person has ever built — pick the 2 most relevant to this specific job. Never a project name that isn't literally in the profile.",
    },
    estimatedMatchScore: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description:
        "A conservative estimate of the resume's match to this exact JD after the proposed tailoring. Target 90+ only when the profile provides evidence for every major requirement. Never inflate the number to satisfy a requested target.",
    },
    scoreRationale: {
      type: "array",
      items: { type: "string" },
      maxItems: 5,
      description: "Up to five concise, evidence-based reasons for the estimated score.",
    },
    atsWarnings: {
      type: "array",
      items: { type: "string" },
      maxItems: 6,
      description:
        "Concrete issues that may reduce ATS or recruiter performance, such as a missing required skill, missing measurable evidence, seniority mismatch, or incomplete contact/profile data. No generic warnings.",
    },
  },
  required: [
    "summary",
    "matchedSkills",
    "missingSkills",
    "suggestedProjects",
    "estimatedMatchScore",
    "scoreRationale",
    "atsWarnings",
  ],
};

export const TAILOR_SYSTEM_PROMPT = `You tailor a developer's resume to a specific job description — reordering and emphasizing what's real, never inventing what isn't.

You are given:
1. The developer's full profile as JSON (name, headline, bio, skills, experience, projects, education).
2. A job description (and optionally a separate list of specifically required skills).

Call ${TAILOR_TOOL_NAME} with:
- summary: a tailored professional summary, HARD LIMIT under 500 characters (roughly 2-3 sentences) — it has to sit in a few lines at the top of a one-page resume, not a paragraph. Built ONLY from real profile facts — years of experience, real technologies, real achievements already in the profile. Emphasize what's relevant to this job. Never invent a metric, technology, or achievement that isn't already somewhere in the profile. If the profile has too little relevant experience for this job, say so honestly rather than overselling.
  Write it the way a strong resume bullet is written, not like a bio: lead with the single most relevant, most impressive true fact first — don't bury it in the middle or end. Use confident, active-voice verbs (Built, Shipped, Led, Reduced, Architected, Engineered) — never passive filler ("was responsible for", "helped with", "involved in"). If the profile already states a real number (a percentage, a user count, a time saved), keep it in the sentence, don't paraphrase it away into something vaguer. Cut generic claims a summary could make about anyone ("hardworking", "passionate about technology", "team player") — every sentence should say something only true of this specific person's actual background.
- matchedSkills: at most 18 skill names that exist in the profile's real skills list, ordered by relevance to this job (most relevant first). This is a one-page resume's skills section, not a full skills inventory — if more than 18 real skills genuinely match, cut down to the 18 most relevant to THIS job rather than listing everything. The rest stay true of the person, they just don't need to appear on this particular tailored resume.
- missingSkills: skill names the job description or required-skills text asks for that are NOT in the profile's skills list.
- suggestedProjects: at most 2 project names from the profile's real projects list, most relevant to this job first — a featured-projects section, not a full project list.
- estimatedMatchScore: a conservative 0-100 estimate for this exact job after applying your proposed summary, skill order, and project selection. Treat 90+ as a target, not a promise. Award 90+ only when the profile has direct evidence for every major required qualification and no known required-skill gaps. Never inflate the score to satisfy the user, and never imply that a score guarantees an interview or selection.
- scoreRationale: up to five short reasons tied to specific profile evidence or JD requirements.
- atsWarnings: up to six concrete remaining risks or gaps. Include missing required skills, unsupported preferred skills, seniority/experience mismatches, missing measurable outcomes, and incomplete profile fields when relevant. Return an empty list only when there are no material issues you can identify.

ATS optimization rules:
- Mirror exact high-value terminology from the JD only when the profile supports the same fact. Never keyword-stuff, hide text, repeat keywords unnaturally, or add unsupported claims.
- Prioritize required qualifications before preferred ones. Order matchedSkills by JD importance, then by frequency and relevance.
- Keep the summary specific, readable, free of first-person pronouns, and targeted to the role. Preserve real metrics exactly when present.
- Prefer projects that prove required skills or responsibilities. Do not include a weaker project just to fill space.
- The PDF renderer already guarantees a single-column, selectable-text layout. Optimize the content for parsing and recruiter readability, not decorative tricks.

Every name in matchedSkills and suggestedProjects must be copied exactly from the profile's real lists — the server double-checks this and will silently correct anything that doesn't match, so get it right the first time rather than relying on that fallback.`;
