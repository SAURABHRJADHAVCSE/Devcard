import {
  fieldMappingSchema,
  fieldMapperJsonSchema,
  FIELD_MAPPER_TOOL_NAME,
  FIELD_MAPPER_TOOL_DESCRIPTION,
  FIELD_MAPPER_SYSTEM_PROMPT,
  type FieldMapping,
} from "./field-mapper-schema";
import type { z } from "zod";
import { formFieldSchema } from "./field-mapper-schema";
import { getProvider } from "./provider";
import { getFullProfile } from "../db/get-full-profile";

type FormField = z.infer<typeof formFieldSchema>;

// Reads the profile itself (Rule 1: MCP server is the source of truth) —
// the extension only ever sends field descriptions, never profile data.
export async function mapFieldsToProfile(fields: FormField[]): Promise<FieldMapping["mappings"]> {
  const profile = await getFullProfile();
  const provider = getProvider();

  const userMessage = JSON.stringify({ profile, fields });
  const raw = await provider.callTool({
    system: FIELD_MAPPER_SYSTEM_PROMPT,
    userMessage,
    toolName: FIELD_MAPPER_TOOL_NAME,
    toolDescription: FIELD_MAPPER_TOOL_DESCRIPTION,
    jsonSchema: fieldMapperJsonSchema,
  });

  const parsed = fieldMappingSchema.safeParse(raw);
  return parsed.success ? parsed.data.mappings : [];
}
