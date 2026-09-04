import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getFullProfile } from "../../db/get-full-profile";
import { renderResumePdf } from "../../pdf/render";
import { PDF_TEMPLATES } from "../../pdf/registry";

// There's no PDF file sitting on disk to "edit" — it's rendered fresh from
// the profile every time. So "editing the resume PDF" from Claude means
// editing the underlying profile (add_skill, update_experience, etc. —
// see profile.ts/skills.ts/experience.ts/projects.ts/education.ts/
// certifications.ts) and then calling get_resume_pdf again to see the
// result reflect those changes.
export function registerPdfTools(server: McpServer) {
  server.registerTool(
    "list_resume_templates",
    {
      title: "List resume PDF templates",
      description: "Lists available resume PDF templates (id, name, description, whether it's ATS-friendly).",
      inputSchema: {},
    },
    async () => {
      const templates = PDF_TEMPLATES.map(({ id, name, description, atsFriendly }) => ({ id, name, description, atsFriendly }));
      return { content: [{ type: "text", text: JSON.stringify(templates, null, 2) }] };
    },
  );

  server.registerTool(
    "get_resume_pdf",
    {
      title: "Get resume PDF",
      description:
        "Renders the current profile as a PDF resume and returns the actual file (base64-encoded). To change what's in it, edit the profile first (add_skill, update_experience, etc.) then call this again — there's no separate PDF to edit directly.",
      inputSchema: {
        template: z.string().optional().describe('Template id from list_resume_templates. Defaults to "polished" if omitted.'),
      },
    },
    async ({ template }) => {
      const full = await getFullProfile();
      const result = await renderResumePdf(template, full);
      const filename = `${(full.profile?.name || "resume").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;

      return {
        content: [
          {
            type: "resource",
            resource: {
              uri: `resume://pdf/${filename}`,
              mimeType: "application/pdf",
              blob: Buffer.from(result.buffer).toString("base64"),
            },
          },
          {
            type: "text",
            text: `Generated ${filename} — ${result.density} density, ${result.pageCount} page${result.pageCount === 1 ? "" : "s"}${
              result.fitOnePage ? "" : " (didn't fit one page even at the tightest density — content genuinely exceeds one page)"
            }.`,
          },
        ],
      };
    },
  );
}
