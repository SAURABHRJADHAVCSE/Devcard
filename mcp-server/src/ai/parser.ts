import {
  deltaSchema,
  deltaJsonSchema,
  DELTA_TOOL_NAME,
  DELTA_TOOL_DESCRIPTION,
  DELTA_SYSTEM_PROMPT,
  type Delta,
} from "./delta-schema";
import { getProvider } from "./provider";

export async function parseMessageToDelta(message: string): Promise<Delta> {
  const provider = getProvider();
  const raw = await provider.callTool({
    system: DELTA_SYSTEM_PROMPT,
    userMessage: message,
    toolName: DELTA_TOOL_NAME,
    toolDescription: DELTA_TOOL_DESCRIPTION,
    jsonSchema: deltaJsonSchema,
  });
  return deltaSchema.parse(raw);
}
