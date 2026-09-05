import { Hono } from "hono";
import { getFullProfile } from "../db/get-full-profile";
import { getResumeVersion } from "../db/resume-versions";
import { PDF_TEMPLATES } from "../pdf/registry";
import { renderResumePdf } from "../pdf/render";
import { applyResumeVersion } from "../pdf/tailor";
import { resumeFilename } from "../pdf/format";

export const pdfRouter = new Hono();

// Lets the extension/dashboard build a template picker without hardcoding
// the list — add a template to pdf/registry.ts and it shows up here too.
pdfRouter.get("/templates", (c) => {
  return c.json(PDF_TEMPLATES.map(({ id, name, description, atsFriendly }) => ({ id, name, description, atsFriendly })));
});

pdfRouter.get("/", async (c) => {
  const full = await getFullProfile();

  const versionId = c.req.query("version");
  let version;
  let template = c.req.query("template");
  if (versionId) {
    version = await getResumeVersion(versionId);
    if (!version) return c.json({ error: `No resume version with id ${versionId}` }, 404);
    template = template ?? version.template ?? undefined;
  }
  // Always resolved through applyResumeVersion, even with no version — see
  // its comment: the "default to featured projects" behavior has to run
  // for a plain live-profile render too, not just a saved version.
  const toRender = applyResumeVersion(full, version);

  const { buffer, pageCount, fitOnePage } = await renderResumePdf(template, toRender);

  const filename = resumeFilename(full.profile?.name, version?.name);
  // Default is a real download (attachment) — the dashboard's resume
  // previewer opts into `?disposition=inline` so the browser renders the
  // PDF in an <iframe> instead of triggering a save dialog.
  const disposition = c.req.query("disposition") === "inline" ? "inline" : "attachment";
  return c.body(new Uint8Array(buffer), 200, {
    "Content-Type": "application/pdf",
    "Content-Disposition": `${disposition}; filename="${filename}"`,
    // Informational only — lets a client warn "this didn't fit one page"
    // without having to parse the PDF itself.
    "X-Resume-Page-Count": String(pageCount),
    "X-Resume-Fit-One-Page": String(fitOnePage),
  });
});
