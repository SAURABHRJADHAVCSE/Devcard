import { renderToBuffer } from "@react-pdf/renderer";
import type { FullProfile } from "../db/get-full-profile";
import type { Density } from "./density";
import { PolishedResume } from "./templates/polished";

// Typed off renderToBuffer's own parameter rather than importing DocumentProps
// directly — @react-pdf/renderer's `export = ReactPDF` namespace style makes
// that type awkward to name; this stays exactly in sync with what the
// renderer actually accepts.
type PdfDocument = Parameters<typeof renderToBuffer>[0];

export interface PdfTemplate {
  id: string;
  name: string;
  description: string;
  atsFriendly: boolean;
  render: (full: FullProfile, density: Density) => PdfDocument;
}

// Only "polished" is registered for now — ats/classic/modern/executive were
// unregistered by request (this repo has no git, so their .tsx files were
// left in place under templates/ rather than deleted; re-adding one later is
// a one-line entry here plus its import above).
//
// Adding a template: write templates/<id>.tsx using the shared primitives
// (primitives.tsx) with your own ResumeTheme, then add one entry here. The
// dashboard's Resumes tab and /api/pdf/templates pick it up automatically.
export const PDF_TEMPLATES: PdfTemplate[] = [
  {
    id: "polished",
    name: "Polished",
    description: "Refined single-column layout with a structured header, navy accents, and ATS-readable typography.",
    atsFriendly: true,
    render: (full, density) => PolishedResume({ full, density }),
  },
];

export const DEFAULT_TEMPLATE_ID = "polished";

export function getTemplate(id: string | undefined): PdfTemplate {
  return PDF_TEMPLATES.find((t) => t.id === id) ?? PDF_TEMPLATES.find((t) => t.id === DEFAULT_TEMPLATE_ID)!;
}
