import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listJobPlatforms, addJobPlatform, deleteJobPlatform } from "../../db/job-platforms";

export function registerJobPlatformTools(server: McpServer) {
  server.registerTool(
    "add_job_platform",
    {
      title: "Add a job platform",
      description:
        "Registers a job site the user actually applies through (e.g. LinkedIn, Naukri) by its base URL. Once registered, list_job_platforms tells Claude which sites to search without the user repeating them, and record_application auto-labels an application's platform from its jobUrl.",
      inputSchema: {
        name: z.string().describe('e.g. "LinkedIn"'),
        baseUrl: z.string().describe('Bare domain or full URL, e.g. "linkedin.com" or "https://www.linkedin.com/jobs"'),
      },
    },
    async ({ name, baseUrl }) => {
      const platform = await addJobPlatform(name, baseUrl);
      return { content: [{ type: "text", text: `Added job platform: ${platform.name} (${platform.baseUrl})` }] };
    },
  );

  server.registerTool(
    "list_job_platforms",
    {
      title: "List job platforms",
      description: "Lists every registered job platform (id, name, base URL). Check this before a job search so you know which sites the user actually wants searched, instead of asking every time.",
      inputSchema: {},
    },
    async () => {
      const platforms = await listJobPlatforms();
      return { content: [{ type: "text", text: JSON.stringify(platforms, null, 2) }] };
    },
  );

  server.registerTool(
    "remove_job_platform",
    {
      title: "Remove a job platform",
      description: "Removes a registered job platform by id. Use list_job_platforms first to find the id.",
      inputSchema: { id: z.string() },
    },
    async ({ id }) => {
      const deleted = await deleteJobPlatform(id);
      return {
        content: [{ type: "text", text: deleted ? `Removed job platform: ${deleted.name}` : `No job platform with id ${id}` }],
      };
    },
  );
}
