import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { tailorResume } from "../../ai/tailor-resume";
import { listResumeVersions, getResumeVersion, saveResumeVersion, deleteResumeVersion } from "../../db/resume-versions";
import { logKnowledgeEvent } from "../../db/log-event";

export function registerResumeVersionTools(server: McpServer) {
  server.registerTool(
    "tailor_resume",
    {
      title: "Tailor resume to a job description",
      description:
        "Analyzes a job description against the real profile and proposes a tailored summary, matched skills, and featured projects — all built from real profile data, never invented. Also reports any skills the JD wants that aren't in the profile yet (missingSkills): before including any of those on the resume, ask the user which ones to add — they go onto this resume only, never into the real knowledge base. This does NOT save anything — call save_resume_version with the final, user-approved fields afterward.",
      inputSchema: {
        jobDescription: z.string().describe("The pasted job description text"),
        requiredSkills: z.string().optional().describe("Optional separate list of required skills, if not already clear from the JD"),
      },
    },
    async ({ jobDescription, requiredSkills }) => {
      const result = await tailorResume(jobDescription, requiredSkills);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.registerTool(
    "save_resume_version",
    {
      title: "Save a tailored resume version",
      description:
        "Saves a named, reusable resume version (e.g. \"Google — Senior SWE, Jan 2026\"). Typically called after tailor_resume, with its summary/matchedSkills/suggestedProjects (plus any missingSkills the user approved adding, merged into skillNames) as the fields here. skillNames/projectNames are the FULL list to show, in order — not a diff. Omitted fields fall back to whatever the live profile currently says.",
      inputSchema: {
        name: z.string().describe('A short label, e.g. "Google — Senior SWE, Jan 2026"'),
        jobDescription: z.string().optional(),
        template: z.string().optional().describe('PDF template id — defaults to "polished" if omitted'),
        summary: z.string().optional().describe("Tailored professional summary; omit to use the profile's real bio"),
        skillNames: z.array(z.string()).optional().describe("Full skill list to show, in order; omit to use the profile's real skills as-is"),
        projectNames: z.array(z.string()).optional().describe("Full project list to feature, in order; omit to use all real projects"),
      },
    },
    async (input) => {
      await logKnowledgeEvent("mcp", { op: "save_resume_version", name: input.name });
      const version = await saveResumeVersion(input);
      return { content: [{ type: "text", text: `Saved resume version "${version.name}" (id: ${version.id})` }] };
    },
  );

  server.registerTool(
    "list_resume_versions",
    {
      title: "List saved resume versions",
      description: "Lists every saved tailored resume version (id, name, template, when created/updated).",
      inputSchema: {},
    },
    async () => {
      const versions = await listResumeVersions();
      const summary = versions.map(({ id, name, template, jobDescription, createdAt, updatedAt }) => ({
        id,
        name,
        template,
        hasJobDescription: !!jobDescription,
        createdAt,
        updatedAt,
      }));
      return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
    },
  );

  server.registerTool(
    "get_resume_version",
    {
      title: "Get a saved resume version",
      description: "Returns the full detail of one saved resume version by id, including its stored job description.",
      inputSchema: { id: z.string() },
    },
    async ({ id }) => {
      const version = await getResumeVersion(id);
      return {
        content: [{ type: "text", text: version ? JSON.stringify(version, null, 2) : `No resume version with id ${id}` }],
      };
    },
  );

  server.registerTool(
    "remove_resume_version",
    {
      title: "Remove a saved resume version",
      description: "Permanently deletes a saved resume version by id. Never touches the real profile — only removes the saved version.",
      inputSchema: { id: z.string() },
    },
    async ({ id }) => {
      await logKnowledgeEvent("mcp", { op: "remove_resume_version", id });
      const deleted = await deleteResumeVersion(id);
      return {
        content: [{ type: "text", text: deleted ? `Removed resume version: ${deleted.name}` : `No resume version with id ${id}` }],
      };
    },
  );
}
