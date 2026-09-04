import { z } from "zod";

// The structured shape every natural-language update gets parsed into.
// Shared between the AI parser (produces it) and the delta applier
// (consumes it), so the two never drift apart on field names.
export const deltaSchema = z.object({
  addSkills: z
    .array(
      z.object({
        name: z.string(),
        category: z.enum(["language", "framework", "tool", "cloud", "soft"]).default("tool"),
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
          category: { type: "string", enum: ["language", "framework", "tool", "cloud", "soft"] },
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
- "I learned X" or "I've been using X" → addSkills (infer a reasonable category and level from context).
- "I shipped/built/launched a project called X" → addProjects.
- "I started at X as a Y" → addExperiences with isCurrent: true.
- "I earned/got/passed the X certification" → addCertifications.
- "I left X" / "I'm no longer at X" → do NOT delete or modify experience automatically; that requires human review. Omit it from the delta.
- If nothing in the message maps to a profile change, call the ${DELTA_TOOL_NAME} tool with all fields omitted.`;
