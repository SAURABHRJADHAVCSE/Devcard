import type { Delta } from "./delta-schema";

export type DirectUpdateContext = {
  experiences: Array<{ company: string; role: string }>;
  projects: Array<{ name: string }>;
};

const UPDATE_INTENT = /\b(?:update|rewrite|replace|set|correct)\b/i;
const DESCRIPTION_MARKER = /\bdescription\s+(?:with\s+exactly|to|with)\s*:\s*/i;

function normalizeLookupKey(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("en-US");
}

function includesKey(haystack: string, needle: string): boolean {
  return haystack.includes(normalizeLookupKey(needle));
}

// Direct replacement requests should not depend on whether the configured LLM
// decides to emit a tool call. The text after "description to:" is user-authored
// data, and the existing record supplies the canonical lookup key.
export function parseDirectDescriptionUpdate(
  message: string,
  context: DirectUpdateContext,
): Delta | undefined {
  if (!UPDATE_INTENT.test(message)) return undefined;

  const marker = DESCRIPTION_MARKER.exec(message);
  if (!marker || marker.index === undefined) return undefined;

  const description = message.slice(marker.index + marker[0].length).trim();
  if (!description) return undefined;

  const targetText = normalizeLookupKey(message.slice(0, marker.index));
  const exactExperienceMatches = context.experiences.filter(
    (experience) =>
      includesKey(targetText, experience.company) && includesKey(targetText, experience.role),
  );
  const companyOnlyExperienceMatches = context.experiences.filter((experience) =>
    includesKey(targetText, experience.company),
  );
  const experienceMatches =
    exactExperienceMatches.length > 0
      ? exactExperienceMatches
      : companyOnlyExperienceMatches.length === 1
        ? companyOnlyExperienceMatches
        : [];
  const projectMatches = context.projects.filter((project) => includesKey(targetText, project.name));

  if (experienceMatches.length === 1 && projectMatches.length === 0) {
    const [experience] = experienceMatches;
    if (!experience) return undefined;
    return {
      updateExperiences: [
        {
          company: experience.company,
          role: experience.role,
          description,
        },
      ],
    };
  }

  if (projectMatches.length === 1 && experienceMatches.length === 0) {
    const [project] = projectMatches;
    if (!project) return undefined;
    return {
      updateProjects: [
        {
          name: project.name,
          description,
        },
      ],
    };
  }

  return undefined;
}

export function formatExistingRecordContext(context: DirectUpdateContext): string {
  const experiences = context.experiences.map(({ company, role }) => ({ company, role }));
  const projects = context.projects.map(({ name }) => ({ name }));
  return `Existing record lookup keys (copy these exact values for updates):\n${JSON.stringify({ experiences, projects })}`;
}
