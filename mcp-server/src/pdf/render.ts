import { renderToBuffer } from "@react-pdf/renderer";
import { PDFDocument } from "pdf-lib";
import type { FullProfile } from "../db/get-full-profile";
import { DENSITY_ORDER, type Density } from "./density";
import { getTemplate } from "./registry";

export interface RenderResult {
  buffer: Buffer;
  density: Density;
  pageCount: number;
  fitOnePage: boolean;
}

// One-page strategy: try the loosest density first (most readable), and
// only fall back to a tighter one if the content actually overflows to a
// second page. This is a measure-by-rendering loop rather than a heuristic
// estimate — @react-pdf/renderer has no pre-layout height API to query, but
// pdf-lib can cheaply read the page count of an already-rendered PDF, so we
// render (usually just once) and check.
export async function renderResumePdf(templateId: string | undefined, full: FullProfile): Promise<RenderResult> {
  const template = getTemplate(templateId);

  let last: { buffer: Buffer; pageCount: number; density: Density } | null = null;

  for (const density of DENSITY_ORDER) {
    const buffer = await renderToBuffer(template.render(full, density));
    const doc = await PDFDocument.load(buffer);
    const pageCount = doc.getPageCount();
    last = { buffer, pageCount, density };

    if (pageCount <= 1) {
      return { buffer, density, pageCount, fitOnePage: true };
    }
  }

  // Even at veryCompact it didn't fit — that's a genuine "too much content"
  // case (spec: handle it intelligently, don't destroy readability further
  // by inventing a 4th, even-smaller density). Return the most compact
  // attempt as-is; it'll be 2 pages, still fully readable.
  return { buffer: last!.buffer, density: last!.density, pageCount: last!.pageCount, fitOnePage: false };
}
