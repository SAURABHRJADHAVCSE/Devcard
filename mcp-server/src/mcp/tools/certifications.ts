import { z } from "zod";
import { eq } from "drizzle-orm";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "../../db/client";
import { certifications } from "../../db/schema";
import { logKnowledgeEvent } from "../../db/log-event";

export function registerCertificationTools(server: McpServer) {
  server.registerTool(
    "add_certification",
    {
      title: "Add certification",
      description: "Adds a certification to the profile.",
      inputSchema: {
        name: z.string(),
        issuer: z.string().optional(),
        issuedDate: z.string().optional().describe('"YYYY-MM" or "YYYY-MM-DD"'),
        expiresDate: z.string().optional(),
        credentialUrl: z.string().optional(),
      },
    },
    async (input) => {
      await logKnowledgeEvent("mcp", { op: "add_certification", ...input });
      const rows = await db.insert(certifications).values(input).returning();
      const row = rows[0]!;

      return {
        content: [{ type: "text", text: `Added certification: ${row.name}${row.issuer ? ` — ${row.issuer}` : ""}` }],
      };
    },
  );

  server.registerTool(
    "remove_certification",
    {
      title: "Remove certification",
      description: "Removes a certification by id. Use get_full_profile or search_profile first to find the id.",
      inputSchema: { id: z.string() },
    },
    async ({ id }) => {
      await logKnowledgeEvent("mcp", { op: "remove_certification", id });
      const [row] = await db.delete(certifications).where(eq(certifications.id, id)).returning();

      return {
        content: [
          { type: "text", text: row ? `Removed certification: ${row.name}` : `No certification with id ${id}` },
        ],
      };
    },
  );
}
