import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { parseMessageToDelta } from "../../ai/parser";
import { applyDelta } from "../../db/apply-delta";
import { logKnowledgeEvent } from "../../db/log-event";

export function registerChatTools(server: McpServer) {
  server.registerTool(
    "update_knowledge_base",
    {
      title: "Update knowledge base (raw text only)",
      description:
        "Runs this server's own LLM call to turn a raw natural-language message into profile changes. " +
        "Built for callers with no LLM of their own (the Chrome extension's chat box posts straight here). " +
        "If YOU are an LLM reading this — e.g. Claude in a conversation — don't call this tool: you already " +
        "understood the user's message, so call add_skill / add_project / add_experience / add_education / " +
        "update_profile directly with the fields you extracted. That skips a redundant second AI call.",
      inputSchema: { message: z.string() },
    },
    async ({ message }) => {
      const delta = await parseMessageToDelta(message);
      await logKnowledgeEvent("chat", delta, message);
      const summary = await applyDelta(delta);

      return {
        content: [
          {
            type: "text",
            text: summary.length ? summary.join("\n") : "Nothing in that message mapped to a profile change.",
          },
        ],
      };
    },
  );
}
