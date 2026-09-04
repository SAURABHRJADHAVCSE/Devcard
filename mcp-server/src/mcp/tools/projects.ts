import { z } from "zod";
import { eq } from "drizzle-orm";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "../../db/client";
import { projects } from "../../db/schema";
import { logKnowledgeEvent } from "../../db/log-event";

export function registerProjectTools(server: McpServer) {
  server.registerTool(
    "add_project",
    {
      title: "Add project",
      description: "Adds a project to the profile.",
      inputSchema: {
        name: z.string(),
        description: z.string().optional(),
        url: z.string().optional(),
        github: z.string().optional(),
        tech: z.array(z.string()).optional(),
        featured: z.boolean().default(false),
        status: z.enum(["active", "archived", "wip"]).default("active"),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      },
    },
    async (input) => {
      await logKnowledgeEvent("mcp", { op: "add_project", ...input });
      const rows = await db
        .insert(projects)
        .values({
          name: input.name,
          description: input.description,
          url: input.url,
          github: input.github,
          tech: input.tech ? JSON.stringify(input.tech) : null,
          featured: input.featured,
          status: input.status,
          startDate: input.startDate,
          endDate: input.endDate,
        })
        .returning();
      const row = rows[0]!;

      return { content: [{ type: "text", text: `Added project: ${row.name}` }] };
    },
  );

  server.registerTool(
    "update_project",
    {
      title: "Update project",
      description: "Updates an existing project by id.",
      inputSchema: {
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        url: z.string().optional(),
        github: z.string().optional(),
        tech: z.array(z.string()).optional(),
        featured: z.boolean().optional(),
        status: z.enum(["active", "archived", "wip"]).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      },
    },
    async ({ id, tech, ...rest }) => {
      await logKnowledgeEvent("mcp", { op: "update_project", id, ...rest, tech });
      const [row] = await db
        .update(projects)
        .set({ ...rest, ...(tech ? { tech: JSON.stringify(tech) } : {}) })
        .where(eq(projects.id, id))
        .returning();

      return {
        content: [
          { type: "text", text: row ? `Updated project: ${row.name}` : `No project with id ${id}` },
        ],
      };
    },
  );

  server.registerTool(
    "remove_project",
    {
      title: "Remove project",
      description: "Removes a project by id. Use get_full_profile or search_profile first to find the id.",
      inputSchema: { id: z.string() },
    },
    async ({ id }) => {
      await logKnowledgeEvent("mcp", { op: "remove_project", id });
      const [row] = await db.delete(projects).where(eq(projects.id, id)).returning();

      return {
        content: [{ type: "text", text: row ? `Removed project: ${row.name}` : `No project with id ${id}` }],
      };
    },
  );
}
