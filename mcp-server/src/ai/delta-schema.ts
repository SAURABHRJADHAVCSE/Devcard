import { z } from "zod";

// The structured shape every natural-language update gets parsed into.
// Shared between the AI parser (produces it) and the delta applier
// (consumes it), so the two never drift apart on field names.
export const deltaSchema = z.object({
  addSkills: z
    .array(
      z.object({
        name: z.string(),
        category: z.enum(["language", "framework", "tool", "cloud", "ai", "soft"]).default("tool"),
        level: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
        years: z.number().optional(),
      }),
    )
    .optional(),
  addProjects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        url: z.string().optional(),
        github: z.string().optional(),
        tech: z.array(z.string()).optional(),
        featured: z.boolean().optional(),
        status: z.enum(["active", "archived", "wip"]).default("active"),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
    )
    .optional(),
  addExperiences: z
    .array(
      z.object({
        company: z.string(),
        role: z.string(),
        description: z.string().optional(),
        location: z.string().optional(),
        employmentType: z.enum(["full-time", "part-time", "freelance", "internship"]).optional(),
        techUsed: z.array(z.string()).optional(),
        startDate: z.string(),
        endDate: z.string().optional(),
        isCurrent: z.boolean().default(false),
      }),
    )
    .optional(),
  // Finds an existing experience by company+role (case-insensitive) and patches only the
  // given fields — company/role are the lookup key, not themselves editable here (a rename
  // is rare enough to not need supporting yet). Distinct from addExperiences specifically so
  // "rewrite my Livlong description" can't accidentally create a second Livlong entry — see
  // apply-delta.ts, which reports a clear "no matching experience" message rather than
  // silently doing nothing when the company/role doesn't match exactly.
  updateExperiences: z
    .array(
      z.object({
        company: z.string(),
        role: z.string(),
        description: z.string().optional(),
        location: z.string().optional(),
        employmentType: z.enum(["full-time", "part-time", "freelance", "internship"]).optional(),
        techUsed: z.array(z.string()).optional(),
        endDate: z.string().optional(),
        isCurrent: z.boolean().optional(),
      }),
    )
    .optional(),
  // Same idea as updateExperiences, keyed by project name.
  updateProjects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        url: z.string().optional(),
        github: z.string().optional(),
        tech: z.array(z.string()).optional(),
        featured: z.boolean().optional(),
        status: z.enum(["active", "archived", "wip"]).optional(),
        endDate: z.string().optional(),
      }),
    )
    .optional(),
  addEducation: z
    .array(
      z.object({
        institution: z.string(),
        degree: z.string().optional(),
        field: z.string().optional(),
        startYear: z.number().optional(),
        endYear: z.number().optional(),
        gpa: z.number().optional(),
        activities: z.string().optional(),
      }),
    )
    .optional(),
  addCertifications: z
    .array(
      z.object({
        name: z.string(),
        issuer: z.string().optional(),
        issuedDate: z.string().optional(),
        expiresDate: z.string().optional(),
        credentialUrl: z.string().optional(),
      }),
    )
    .optional(),
  profileUpdates: z
    .object({
      name: z.string().optional(),
      headline: z.string().optional(),
      bio: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      location: z.string().optional(),
      website: z.string().optional(),
      github: z.string().optional(),
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
    })
    .optional(),
});

export type Delta = z.infer<typeof deltaSchema>;

export const DELTA_TOOL_NAME = "record_profile_delta";
export const DELTA_TOOL_DESCRIPTION =
  "Records the structured changes to apply to the user's developer profile.";

// Hand-written JSON Schema mirroring deltaSchema above (rather than generated
// from it) so the tool-call contract sent to any provider is explicit and
// reviewable. Shared by every provider in ./providers/*.ts, each of which
// wraps it in that provider's own tool-definition envelope.
export const deltaJsonSchema = {
  type: "object" as const,
  properties: {
    addSkills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          category: { type: "string", enum: ["language", "framework", "tool", "cloud", "ai", "soft"] },
          level: { type: "string", enum: ["beginner", "intermediate", "advanced", "expert"] },
          years: { type: "number" },
        },
        required: ["name"],
      },
    },
    addProjects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          url: { type: "string" },
          github: { type: "string" },
          tech: { type: "array", items: { type: "string" } },
          featured: { type: "boolean" },
          status: { type: "string", enum: ["active", "archived", "wip"] },
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
        required: ["name"],
      },
    },
    addExperiences: {
      type: "array",
      items: {
        type: "object",
        properties: {
          company: { type: "string" },
          role: { type: "string" },
          description: { type: "string" },
          location: { type: "string" },
          employmentType: {
            type: "string",
            enum: ["full-time", "part-time", "freelance", "internship"],
          },
          techUsed: { type: "array", items: { type: "string" } },
          startDate: { type: "string", description: "YYYY-MM" },
          endDate: { type: "string" },
          isCurrent: { type: "boolean" },
        },
        required: ["company", "role", "startDate"],
      },
    },
    updateExperiences: {
      type: "array",
      items: {
        type: "object",
        properties: {
          company: { type: "string", description: "Must match an existing experience's company exactly (case-insensitive) — the lookup key, not itself editable here" },
          role: { type: "string", description: "Must match an existing experience's role exactly (case-insensitive) — the lookup key, not itself editable here" },
          description: { type: "string" },
          location: { type: "string" },
          employmentType: {
            type: "string",
            enum: ["full-time", "part-time", "freelance", "internship"],
          },
          techUsed: { type: "array", items: { type: "string" } },
          endDate: { type: "string" },
          isCurrent: { type: "boolean" },
        },
        required: ["company", "role"],
      },
    },
    updateProjects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Must match an existing project's name exactly (case-insensitive) — the lookup key, not itself editable here" },
          description: { type: "string" },
          url: { type: "string" },
          github: { type: "string" },
          tech: { type: "array", items: { type: "string" } },
          featured: { type: "boolean" },
          status: { type: "string", enum: ["active", "archived", "wip"] },
          endDate: { type: "string" },
        },
        required: ["name"],
      },
    },
    addEducation: {
      type: "array",
      items: {
        type: "object",
        properties: {
          institution: { type: "string" },
          degree: { type: "string" },
          field: { type: "string" },
          startYear: { type: "number" },
          endYear: { type: "number" },
          gpa: { type: "number" },
          activities: { type: "string" },
        },
        required: ["institution"],
      },
    },
    addCertifications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          issuer: { type: "string" },
          issuedDate: { type: "string", description: '"YYYY-MM" or "YYYY-MM-DD"' },
          expiresDate: { type: "string" },
          credentialUrl: { type: "string" },
        },
        required: ["name"],
      },
    },
    profileUpdates: {
      type: "object",
      properties: {
        name: { type: "string" },
        headline: { type: "string" },
        bio: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        location: { type: "string" },
        website: { type: "string" },
        github: { type: "string" },
        linkedin: { type: "string" },
        twitter: { type: "string" },
      },
    },
  },
};

export const DELTA_SYSTEM_PROMPT = `You convert a developer's casual, natural-language update about their work into a structured profile delta.

Rules:
- Only include fields the message actually supports. Don't invent dates, tech, or details.
- "I learned X" or "I've been using X" → addSkills (infer a reasonable category and level from
  context). Use category "ai" for anything specifically about building with LLMs — model APIs
  (OpenAI/Claude/Gemini/etc.), agent/orchestration frameworks, MCP, RAG, embeddings/vector
  search, prompt engineering, or AI SDKs (Vercel AI SDK, LangChain, etc.) — these deserve their
  own resume section rather than being buried in "tool" or "framework". A general-purpose tool
  that merely supports AI work (Docker, Postgres) still stays in its normal category. Check the
  profile's existing skills first: the server only blocks an exact
  case-insensitive name match, so if X is really the same skill already listed under a
  different name or abbreviation ("Express" when "Express.js" is already there, "OpenAI" when
  "OpenAI API" is already there), don't add a near-duplicate — omit it, since it's already
  represented.
- "I shipped/built/launched a project called X" → addProjects, only when X is an independent,
  freestanding thing with its own name — a side project, an app, an open-source tool. A
  feature, migration, or achievement described AS PART OF a job (e.g. "I migrated our app to
  Next.js at work", "I built the search feature for my employer's product") is NOT a project —
  it belongs in that experience's own description, not as a separate addProjects entry. When in
  doubt whether something is a standalone project or just a detail of an existing job, treat it
  as a detail and omit it rather than inventing a new project record.
- "I started at X as a Y" → addExperiences with isCurrent: true, but only if X + that role
  doesn't already appear in the profile's experience list.
- "Rewrite/update/improve my description at X (as Y)" or any correction to an existing job's
  details → updateExperiences, with company and role copied EXACTLY as they already appear in
  the profile (that's the lookup key, not new text to save) and only the changed field(s) set.
  Never use addExperiences for this — that creates a second, duplicate entry instead of fixing
  the one that exists. If you're not sure the company + role you have matches an existing entry
  exactly, use get_full_profile-equivalent context already given to you to copy the exact
  existing spelling rather than guessing.
- "Rewrite/update/improve my project X's description" → updateProjects the same way, keyed by
  the project's exact existing name. Never use addProjects for an existing project.
- "I earned/got/passed the X certification" → addCertifications.
- "I left X" / "I'm no longer at X" → do NOT delete experience automatically; that requires
  human review and removal through remove_experience. You may set isCurrent: false and an
  endDate via updateExperiences if given one, but never delete or fabricate an end date.
- "Update/change/set my summary (or bio, or about-me) to: ..." → profileUpdates.bio, with the
  exact text given, verbatim. "Summary" and "bio" are the same field — the profile has no
  separate "summary" field, so never skip a summary request just because the literal word
  "bio" wasn't used.
- "Update/change/set my headline (or title) to: ..." → profileUpdates.headline, verbatim.
- Any other direct "update my [name/email/phone/location/website/github/linkedin/twitter] to:
  ..." → the matching profileUpdates field, verbatim. Don't paraphrase or shorten text the user
  gave you exactly — use it as-is.
- If nothing in the message maps to a profile change, call the ${DELTA_TOOL_NAME} tool with all fields omitted.`;
