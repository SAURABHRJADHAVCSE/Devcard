import { z } from "zod";
import { sql } from "drizzle-orm";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "../../db/client";
import { skills } from "../../db/schema";
import { logKnowledgeEvent } from "../../db/log-event";

export function registerSkillTools(server: McpServer) {
  server.registerTool(
    "add_skill",
    {
      title: "Add skill",
      description: "Adds a skill to the profile directly, no AI parsing.",
      inputSchema: {
        name: z.string(),
        category: z.enum(["language", "framework", "tool", "cloud", "soft"]).default("tool"),
        level: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
        years: z.number().optional(),
      },
    },
    async ({ name, category, level, years }) => {
      const [existing] = await db
        .select()
        .from(skills)
        .where(sql`lower(${skills.name}) = lower(${name})`)
        .limit(1);
      if (existing) {
        return {
          content: [{ type: "text", text: `Skill "${name}" already exists.` }],
        };
      }

      await logKnowledgeEvent("mcp", { op: "add_skill", name, category, level, years });
      const rows = await db
        .insert(skills)
        .values({ name, category, level, yearsOfExperience: years })
        .returning();
      const row = rows[0]!;

      return {
        content: [{ type: "text", text: `Added skill: ${row.name} (${row.category})` }],
      };
    },
  );

  server.registerTool(
    "remove_skill",
    {
      title: "Remove skill",
      description: "Removes a skill by name (case-insensitive).",
      inputSchema: { name: z.string() },
    },
    async ({ name }) => {
      await logKnowledgeEvent("mcp", { op: "remove_skill", name });
      const deleted = await db
        .delete(skills)
        .where(sql`lower(${skills.name}) = lower(${name})`)
        .returning();

      return {
        content: [
          {
            type: "text",
            text: deleted.length ? `Removed skill: ${name}` : `No skill named "${name}" found.`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "list_skills",
    {
      title: "List skills",
      description: "Lists all skills, grouped by category.",
      inputSchema: {},
    },
    async () => {
      const rows = await db.select().from(skills);
      return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
    },
  );
}
