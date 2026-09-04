import { z } from "zod";

// One form field as the extension sees it — `id` is a request-scoped label
// the content script assigns itself (not a DOM id), just so the response can
// be matched back to the right field.
export const formFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.string().optional(),
  placeholder: z.string().optional(),
});

export const mapFieldsRequestSchema = z.object({
  fields: z.array(formFieldSchema).max(200),
});

export const fieldMappingSchema = z.object({
  mappings: z.array(z.object({ id: z.string(), value: z.string() })),
});

export type FieldMapping = z.infer<typeof fieldMappingSchema>;

export const FIELD_MAPPER_TOOL_NAME = "map_form_fields";
export const FIELD_MAPPER_TOOL_DESCRIPTION =
  "Records which profile value fills which form field.";

export const fieldMapperJsonSchema = {
  type: "object" as const,
  properties: {
    mappings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          value: { type: "string" },
        },
        required: ["id", "value"],
      },
    },
  },
  required: ["mappings"],
};

export const FIELD_MAPPER_SYSTEM_PROMPT = `You fill out an unfamiliar web form using a developer's profile data.

You are given:
1. The developer's full profile as JSON (name, headline, bio, skills, experience, projects, education, contact info).
2. A list of form fields on the page, each with an id, a label, an input type, and sometimes a placeholder.

For each field you can confidently map to a real value from the profile, call ${FIELD_MAPPER_TOOL_NAME} with that field's id and the value to fill in. Rules:
- Only include fields you're confident about. Skip anything ambiguous — a wrong value is worse than a blank field.
- Skip password, OTP/verification-code, CAPTCHA, and payment fields entirely.
- Format the value for the field: a single string, not JSON — e.g. join skill names with ", " if a field wants "skills".
- Never invent data that isn't in the profile.`;
