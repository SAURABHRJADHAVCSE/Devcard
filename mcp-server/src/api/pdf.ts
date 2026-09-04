import { Hono } from "hono";
import { renderToBuffer } from "@react-pdf/renderer";
import { getFullProfile } from "../db/get-full-profile";
import { PDF_TEMPLATES, getTemplate } from "../pdf/registry";

export const pdfRouter = new Hono();

// Lets the extension/dashboard build a template picker without hardcoding
// the list — add a template to pdf/registry.ts and it shows up here too.
pdfRouter.get("/templates", (c) => {
  return c.json(PDF_TEMPLATES.map(({ id, name, description, atsFriendly }) => ({ id, name, description, atsFriendly })));
});

pdfRouter.get("/", async (c) => {
  const template = getTemplate(c.req.query("template"));
  const full = await getFullProfile();
  const buffer = await renderToBuffer(template.render(full));

  const filename = `${(full.profile?.name || "resume").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;
  return c.body(new Uint8Array(buffer), 200, {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${filename}"`,
  });
});
