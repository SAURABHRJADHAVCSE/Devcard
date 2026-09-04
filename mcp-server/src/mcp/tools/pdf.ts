import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getFullProfile } from "../../db/get-full-profile";
import { getResumeVersion } from "../../db/resume-versions";
import { renderResumePdf } from "../../pdf/render";
import { applyResumeVersion } from "../../pdf/tailor";
import { PDF_TEMPLATES } from "../../pdf/registry";

// There's no PDF file sitting on disk to "edit" — it's rendered fresh from
// the profile every time. So "editing the resume PDF" from Claude means
// either editing the underlying profile directly (add_skill,
// update_experience, etc.) or, for a job-specific version, tailoring it
// (tailor_resume + save_resume_version in resume-versions.ts) and passing
// that version's id here.
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
        "Renders a profile as a PDF resume and returns the actual file (base64-encoded). With no versionId, renders the live profile as-is — edit the profile first (add_skill, update_experience, etc.) then call this again to see changes. With a versionId (from save_resume_version/list_resume_versions), renders that tailored version instead.",
      inputSchema: {
        template: z
          .string()
          .optional()
          .describe('Template id from list_resume_templates. Defaults to "polished", or the version\'s own template if versionId is given.'),
        versionId: z.string().optional().describe("Render this saved resume version's tailoring instead of the live profile as-is."),
      },
    },
    async ({ template, versionId }) => {
      const full = await getFullProfile();

      let merged = full;
      let resolvedTemplate = template;
      if (versionId) {
        const version = await getResumeVersion(versionId);
        if (!version) {
          return { content: [{ type: "text", text: `No resume version with id ${versionId}` }] };
        }
        merged = applyResumeVersion(full, version);
        resolvedTemplate = template ?? version.template ?? undefined;
      }

      const result = await renderResumePdf(resolvedTemplate, merged);
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
