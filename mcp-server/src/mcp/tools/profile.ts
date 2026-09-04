import { z } from "zod";
import { eq, like, or } from "drizzle-orm";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "../../db/client";
import { profile, skills, experiences, projects } from "../../db/schema";
import { getFullProfile, formatResumeMarkdown } from "../../db/get-full-profile";
import { logKnowledgeEvent } from "../../db/log-event";

export function registerProfileTools(server: McpServer) {
  server.registerTool(
    "get_full_profile",
    {
      title: "Get full profile",
      description: "Returns the complete profile as structured JSON (all tables joined).",
      inputSchema: {},
    },
    async () => {
      const full = await getFullProfile();
      return { content: [{ type: "text", text: JSON.stringify(full, null, 2) }] };
    },
  );

  server.registerTool(
    "update_profile",
    {
      title: "Update profile",
      description: "Direct update to core profile fields (name, headline, bio, contact info).",
      inputSchema: {
        name: z.string().optional(),
        headline: z.string().optional(),
        bio: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        location: z.string().optional(),
        website: z.string().optional(),
        github: z.string().optional(),
        linkedin: z.string().optional(),
        twitter: z.string().optional(),
      },
    },
    async (updates) => {
      await logKnowledgeEvent("mcp", { op: "update_profile", ...updates });
      const [exists] = await db.select().from(profile).where(eq(profile.id, "me")).limit(1);
      if (exists) {
        await db.update(profile).set(updates).where(eq(profile.id, "me"));
      } else {
        await db.insert(profile).values({ ...updates, id: "me", name: updates.name ?? "" });
      }

      return { content: [{ type: "text", text: `Profile updated: ${Object.keys(updates).join(", ")}` }] };
    },
  );

  server.registerTool(
    "get_resume_text",
    {
      title: "Get resume text",
      description: "Returns the profile formatted as clean markdown — ready to paste anywhere.",
      inputSchema: {},
    },
    async () => {
      const full = await getFullProfile();
      return { content: [{ type: "text", text: formatResumeMarkdown(full) }] };
    },
  );

  server.registerTool(
    "search_profile",
    {
      title: "Search profile",
      description: "Keyword search across all profile content. Returns matching snippets with context.",
      inputSchema: { query: z.string() },
    },
    async ({ query }) => {
      const pattern = `%${query}%`;
      const [skillHits, expHits, projectHits] = await Promise.all([
        db.select().from(skills).where(like(skills.name, pattern)),
        db
          .select()
          .from(experiences)
          .where(or(like(experiences.company, pattern), like(experiences.role, pattern), like(experiences.description, pattern))),
        db
          .select()
          .from(projects)
          .where(or(like(projects.name, pattern), like(projects.description, pattern))),
      ]);

      const results = [
        ...skillHits.map((s) => ({ type: "skill", snippet: s.name })),
        ...expHits.map((e) => ({ type: "experience", snippet: `${e.role} at ${e.company}` })),
        ...projectHits.map((p) => ({ type: "project", snippet: p.name })),
      ];

      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
    },
  );
}
