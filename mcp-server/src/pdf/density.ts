// Centralized one-page-fit strategy: instead of duplicating spacing math in
// every template, each template asks for a DensityScale and builds its
// StyleSheet from it. render.ts tries these in order (loosest first) and
// keeps the first one that actually fits one page — see render.ts.
//
// Values shrink gradually and stay within the professional/readable ranges
// from the spec (body 9-11pt, name 18-26pt, headings 10-14pt, margins
// 20-40pt) — "compact" and "veryCompact" reduce spacing far more
// aggressively than font size, since cramped line spacing reads better than
// tiny text.
export type Density = "comfortable" | "compact" | "veryCompact";

export const DENSITY_ORDER: Density[] = ["comfortable", "compact", "veryCompact"];

export interface DensityScale {
  fontSize: {
    name: number;
    headline: number;
    body: number;
    sectionHeader: number;
    entryTitle: number;
    small: number;
  };
  lineHeight: number;
  page: { paddingVertical: number; paddingHorizontal: number };
  gap: {
    afterName: number;
    afterHeadline: number;
    afterContact: number;
    afterSummary: number;
    sectionTop: number;
    afterSectionHeader: number;
    betweenEntries: number;
    withinEntry: number;
    betweenBullets: number;
  };
}

const SCALES: Record<Density, DensityScale> = {
  comfortable: {
    fontSize: { name: 22, headline: 11.5, body: 10.5, sectionHeader: 11, entryTitle: 10.5, small: 9.5 },
    lineHeight: 1.42,
    page: { paddingVertical: 38, paddingHorizontal: 44 },
    gap: {
      afterName: 4,
      afterHeadline: 7,
      afterContact: 13,
      afterSummary: 15,
      sectionTop: 15,
      afterSectionHeader: 7,
      betweenEntries: 10,
      withinEntry: 2.5,
      betweenBullets: 2,
    },
  },
  compact: {
    fontSize: { name: 19, headline: 10.5, body: 10, sectionHeader: 10.5, entryTitle: 10, small: 9 },
    lineHeight: 1.28,
    page: { paddingVertical: 28, paddingHorizontal: 38 },
    gap: {
      afterName: 3,
      afterHeadline: 5,
      afterContact: 9,
      afterSummary: 10,
      sectionTop: 10,
      afterSectionHeader: 5,
      betweenEntries: 6,
      withinEntry: 1.5,
      betweenBullets: 1.2,
    },
  },
  veryCompact: {
    fontSize: { name: 17, headline: 10, body: 9.3, sectionHeader: 9.8, entryTitle: 9.5, small: 8.5 },
    lineHeight: 1.16,
    page: { paddingVertical: 20, paddingHorizontal: 32 },
    gap: {
      afterName: 2,
      afterHeadline: 4,
      afterContact: 7,
      afterSummary: 7,
      sectionTop: 7,
      afterSectionHeader: 3.5,
      betweenEntries: 4,
      withinEntry: 1,
      betweenBullets: 0.8,
    },
  },
};

export function getDensityScale(density: Density): DensityScale {
  return SCALES[density];
}
