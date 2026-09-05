import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listApplications, recordApplication, updateApplication, deleteApplication } from "../../db/applications";

const STATUS_VALUES = ["applied", "interviewing", "rejected", "offer"] as const;

export function registerApplicationTools(server: McpServer) {
  server.registerTool(
    "record_application",
    {
      title: "Record a job application",
      description:
        "Logs a job application that was actually submitted — never call this for a job merely being considered or a resume merely being prepared (that's tailor_resume/save_resume_version). If jobUrl matches a registered job platform's base URL, platform is auto-filled from it — pass platform explicitly to override or when there's no matching registration.",
      inputSchema: {
        company: z.string(),
        role: z.string(),
        platform: z.string().optional().describe("Overrides auto-detection from jobUrl"),
        jobUrl: z.string().optional(),
        resumeVersionId: z.string().optional().describe("id from save_resume_version/list_resume_versions, if a tailored version was used"),
        notes: z.string().optional(),
      },
    },
    async (input) => {
      const application = await recordApplication(input);
      return {
        content: [
          {
            type: "text",
            text: `Recorded application: ${application.role} at ${application.company}${application.platform ? ` (${application.platform})` : ""}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "list_applications",
    {
      title: "List job applications",
      description: "Lists every recorded job application, most recently applied first.",
      inputSchema: {},
    },
    async () => {
      const apps = await listApplications();
      return { content: [{ type: "text", text: JSON.stringify(apps, null, 2) }] };
    },
  );

  server.registerTool(
    "update_application",
    {
      title: "Update a job application",
      description: "Updates a recorded application's status and/or notes — e.g. after hearing back from a recruiter. Use list_applications first to find the id.",
      inputSchema: {
        id: z.string(),
        status: z.enum(STATUS_VALUES).optional(),
        notes: z.string().optional(),
      },
    },
    async ({ id, ...patch }) => {
      const updated = await updateApplication(id, patch);
      return {
        content: [
          {
            type: "text",
            text: updated ? `Updated application: ${updated.role} at ${updated.company} → ${updated.status}` : `No application with id ${id}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "remove_application",
    {
      title: "Remove a job application",
      description: "Permanently deletes a recorded application by id.",
      inputSchema: { id: z.string() },
    },
    async ({ id }) => {
      const deleted = await deleteApplication(id);
      return {
        content: [{ type: "text", text: deleted ? `Removed application: ${deleted.role} at ${deleted.company}` : `No application with id ${id}` }],
      };
    },
  );
}
