import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getFullProfile } from "../../db/get-full-profile";
import { getResumeVersion } from "../../db/resume-versions";
import { renderResumePdf } from "../../pdf/render";
import { applyResumeVersion } from "../../pdf/tailor";
import { PDF_TEMPLATES } from "../../pdf/registry";
import { resumeFilename } from "../../pdf/format";

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

      let version;
      let resolvedTemplate = template;
      if (versionId) {
        version = await getResumeVersion(versionId);
        if (!version) {
          return { content: [{ type: "text", text: `No resume version with id ${versionId}` }] };
        }
        resolvedTemplate = template ?? version.template ?? undefined;
      }
      // Always resolved through applyResumeVersion, even with no version —
      // see its comment: the "default to featured projects" behavior has
      // to run for a plain live-profile render too, not just a saved one.
      const merged = applyResumeVersion(full, version);

      const result = await renderResumePdf(resolvedTemplate, merged);
      const filename = resumeFilename(full.profile?.name);

      // Claude Desktop's UI currently doesn't surface MCP EmbeddedResource
      // blocks (the `resource`/blob content below) as a downloadable
      // artifact at all — confirmed as a known, filed, client-side
      // limitation (anthropics/claude-ai-mcp#287), not a bug in this
      // server: the blob is spec-compliant and does reach the model, Desktop
      // just has nowhere in its UI to hand it to the human yet. A direct
      // HTTP link is the reliable fallback regardless of which MCP client
      // is asking, so it's always included as text (which every client
      // renders) — put it first, since for Desktop right now it's the ONLY
      // part of this response a human can actually act on.
      const port = process.env.PORT ?? "6366";
      const query = versionId ? `version=${versionId}` : resolvedTemplate ? `template=${resolvedTemplate}` : "";
      const downloadUrl = `http://localhost:${port}/api/pdf${query ? `?${query}` : ""}`;

      return {
        content: [
          {
            type: "text",
            text:
              `Generated ${filename} — ${result.density} density, ${result.pageCount} page${result.pageCount === 1 ? "" : "s"}${
                result.fitOnePage ? "" : " (didn't fit one page even at the tightest density — content genuinely exceeds one page)"
              }.\n\n` +
              `Download it directly: ${downloadUrl}\n` +
              `(Some MCP clients, including Claude Desktop as of now, can't surface the file this tool call also returns ` +
              `directly in chat — this link always works instead, since it downloads straight from your local Devcard server.)`,
          },
          {
            type: "resource",
            resource: {
              uri: `resume://pdf/${filename}`,
              mimeType: "application/pdf",
              blob: Buffer.from(result.buffer).toString("base64"),
            },
          },
        ],
      };
    },
  );
}
