import { Hono } from "hono";
import { getFullProfile } from "../db/get-full-profile";
import { PDF_TEMPLATES } from "../pdf/registry";
import { renderResumePdf } from "../pdf/render";

export const pdfRouter = new Hono();

// Lets the extension/dashboard build a template picker without hardcoding
// the list — add a template to pdf/registry.ts and it shows up here too.
pdfRouter.get("/templates", (c) => {
  return c.json(PDF_TEMPLATES.map(({ id, name, description, atsFriendly }) => ({ id, name, description, atsFriendly })));
});

pdfRouter.get("/", async (c) => {
  const full = await getFullProfile();
  const { buffer, pageCount, fitOnePage } = await renderResumePdf(c.req.query("template"), full);

  const filename = `${(full.profile?.name || "resume").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;
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
