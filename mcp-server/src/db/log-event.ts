import { db } from "./client";
import { knowledgeEvents } from "./schema";

export type EventSource = "chat" | "mcp" | "direct" | "import";

// Logs before applying (Rule 6) so a crash mid-apply still leaves a record
// of what was attempted, not just what succeeded.
export async function logKnowledgeEvent(
  source: EventSource,
  parsedDelta: unknown,
  rawMessage?: string,
) {
  const [row] = await db
    .insert(knowledgeEvents)
    .values({
      source,
      rawMessage: rawMessage ?? null,
      parsedDelta: JSON.stringify(parsedDelta),
    })
    .returning();
  return row;
}
