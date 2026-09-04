import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "../../db/client";
import { education } from "../../db/schema";
import { logKnowledgeEvent } from "../../db/log-event";

export function registerEducationTools(server: McpServer) {
  server.registerTool(
    "add_education",
    {
      title: "Add education",
      description: "Adds an education entry to the profile.",
      inputSchema: {
        institution: z.string(),
        degree: z.string().optional(),
        field: z.string().optional(),
        startYear: z.number().optional(),
        endYear: z.number().optional(),
        gpa: z.number().optional(),
        activities: z.string().optional(),
      },
    },
    async (input) => {
      await logKnowledgeEvent("mcp", { op: "add_education", ...input });
      const rows = await db.insert(education).values(input).returning();
      const row = rows[0]!;

      return {
        content: [{ type: "text", text: `Added education: ${row.degree ?? ""} at ${row.institution}`.trim() }],
      };
    },
  );
}
