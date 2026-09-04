import { z } from "zod";
import { eq } from "drizzle-orm";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "../../db/client";
import { experiences } from "../../db/schema";
import { logKnowledgeEvent } from "../../db/log-event";

const employmentType = z
  .enum(["full-time", "part-time", "freelance", "internship"])
  .optional();

export function registerExperienceTools(server: McpServer) {
  server.registerTool(
    "add_experience",
    {
      title: "Add experience",
      description: "Adds a work experience entry to the profile.",
      inputSchema: {
        company: z.string(),
        role: z.string(),
        description: z.string().optional(),
        startDate: z.string().describe('"YYYY-MM"'),
        endDate: z.string().optional(),
        techUsed: z.array(z.string()).optional(),
        isCurrent: z.boolean().default(false),
        employmentType,
        location: z.string().optional(),
      },
    },
    async (input) => {
      await logKnowledgeEvent("mcp", { op: "add_experience", ...input });
      const rows = await db
        .insert(experiences)
        .values({
          company: input.company,
          role: input.role,
          description: input.description,
          location: input.location,
          employmentType: input.employmentType,
          techUsed: input.techUsed ? JSON.stringify(input.techUsed) : null,
          startDate: input.startDate,
          endDate: input.endDate,
          isCurrent: input.isCurrent,
        })
        .returning();
      const row = rows[0]!;

      return {
        content: [{ type: "text", text: `Added experience: ${row.role} at ${row.company}` }],
      };
    },
  );

  server.registerTool(
    "update_experience",
    {
      title: "Update experience",
      description: "Updates an existing experience entry by id.",
      inputSchema: {
        id: z.string(),
        company: z.string().optional(),
        role: z.string().optional(),
        description: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        techUsed: z.array(z.string()).optional(),
        isCurrent: z.boolean().optional(),
        employmentType,
        location: z.string().optional(),
      },
    },
    async ({ id, techUsed, ...rest }) => {
      await logKnowledgeEvent("mcp", { op: "update_experience", id, ...rest, techUsed });
      const [row] = await db
        .update(experiences)
        .set({ ...rest, ...(techUsed ? { techUsed: JSON.stringify(techUsed) } : {}) })
        .where(eq(experiences.id, id))
        .returning();

      return {
        content: [
          {
            type: "text",
            text: row ? `Updated experience: ${row.role} at ${row.company}` : `No experience with id ${id}`,
          },
        ],
      };
    },
  );
}
