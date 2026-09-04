import { renderToBuffer } from "@react-pdf/renderer";
import type { FullProfile } from "../db/get-full-profile";
import { AtsResume } from "./templates/ats";
import { ModernResume } from "./templates/modern";

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
  render: (full: FullProfile) => PdfDocument;
}

export const PDF_TEMPLATES: PdfTemplate[] = [
  {
    id: "ats",
    name: "ATS Simple",
    description: "Single-column, plain text, no colors or graphics — built to parse cleanly in applicant tracking systems.",
    atsFriendly: true,
    render: (full) => AtsResume({ full }),
  },
  {
    id: "modern",
    name: "Modern",
    description: "Same content and layout, with color accents — best for a human reader, not optimized for ATS parsing.",
    atsFriendly: false,
    render: (full) => ModernResume({ full }),
  },
];

export const DEFAULT_TEMPLATE_ID = "ats";

export function getTemplate(id: string | undefined): PdfTemplate {
  return PDF_TEMPLATES.find((t) => t.id === id) ?? PDF_TEMPLATES.find((t) => t.id === DEFAULT_TEMPLATE_ID)!;
}
