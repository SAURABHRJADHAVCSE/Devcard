import {
  deltaSchema,
  deltaJsonSchema,
  DELTA_TOOL_NAME,
  DELTA_TOOL_DESCRIPTION,
  DELTA_SYSTEM_PROMPT,
  type Delta,
} from "./delta-schema";
import { getFullProfile } from "../db/get-full-profile";
import { formatExistingRecordContext, parseDirectDescriptionUpdate } from "./direct-update";
import { getProvider } from "./provider";

export async function parseMessageToDelta(message: string): Promise<Delta> {
  const fullProfile = await getFullProfile();
  const lookupContext = {
    experiences: fullProfile.experiences.map(({ company, role }) => ({ company, role })),
    projects: fullProfile.projects.map(({ name }) => ({ name })),
  };
  const directUpdate = parseDirectDescriptionUpdate(message, lookupContext);
  if (directUpdate) return directUpdate;

  const provider = getProvider();
  const raw = await provider.callTool({
    system: `${DELTA_SYSTEM_PROMPT}\n\n${formatExistingRecordContext(lookupContext)}`,
    userMessage: message,
    toolName: DELTA_TOOL_NAME,
    toolDescription: DELTA_TOOL_DESCRIPTION,
    jsonSchema: deltaJsonSchema,
  });
  return deltaSchema.parse(raw);
}
