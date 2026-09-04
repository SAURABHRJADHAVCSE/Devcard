// Centralized one-page-fit strategy: instead of duplicating spacing math in
// every template, each template asks for a DensityScale and builds its
// StyleSheet from it. render.ts tries these in order (loosest first) and
// keeps the first one that actually fits one page — see render.ts.
//
// Font sizes, line-height, spacing, and page margins are pinned to specific
// resume-design ranges (name 20-24pt, section headers 11-12pt with slightly
// increased letter-spacing, job title/company 10.5-11pt, body 10-10.5pt,
// dates/location 9.5-10pt, line-height 1.15-1.25, margins 0.5-0.75in —
// 36-54pt, 4-6pt after a section header, 6-8pt between job entries) and held
// roughly constant across all three tiers; "compact" and "veryCompact"
// instead shrink the gaps this spec doesn't pin (after name/headline/
// contact/summary, within an entry, between bullets) far more aggressively,
// since cramped gaps read better than text/spacing outside those ranges. A
// resume that still doesn't fit one page at veryCompact prints as two pages
// rather than shrinking fonts/margins out of range — two pages is the
// accepted outcome for genuinely extensive experience, not a failure.
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

// 40pt / 44pt ≈ 0.55in / 0.61in — within the 0.5-0.75in margin range at
// every density tier. Margins don't shrink with density; only spacing and
// (mildly, and only where the spec leaves room) font size do.
const PAGE_MARGINS = { paddingVertical: 40, paddingHorizontal: 44 };

const SCALES: Record<Density, DensityScale> = {
  comfortable: {
    fontSize: { name: 22, headline: 12, body: 10.5, sectionHeader: 12, entryTitle: 11, small: 10 },
    lineHeight: 1.25,
    page: PAGE_MARGINS,
    gap: {
      afterName: 4,
      afterHeadline: 7,
      afterContact: 13,
      afterSummary: 15,
      sectionTop: 15,
      afterSectionHeader: 6,
      betweenEntries: 8,
      withinEntry: 2.5,
      betweenBullets: 2,
    },
  },
  compact: {
    fontSize: { name: 21, headline: 11, body: 10.2, sectionHeader: 11.5, entryTitle: 10.75, small: 9.7 },
    lineHeight: 1.2,
    page: PAGE_MARGINS,
    gap: {
      afterName: 3,
      afterHeadline: 5,
      afterContact: 9,
      afterSummary: 10,
      sectionTop: 10,
      afterSectionHeader: 5,
      betweenEntries: 7,
      withinEntry: 1.5,
      betweenBullets: 1.2,
    },
  },
  veryCompact: {
    fontSize: { name: 20, headline: 10.5, body: 10, sectionHeader: 11, entryTitle: 10.5, small: 9.5 },
    lineHeight: 1.15,
    page: PAGE_MARGINS,
    gap: {
      afterName: 2,
      afterHeadline: 4,
      afterContact: 7,
      afterSummary: 7,
      sectionTop: 7,
      afterSectionHeader: 4,
      betweenEntries: 6,
      withinEntry: 1,
      betweenBullets: 0.8,
    },
  },
};

export function getDensityScale(density: Density): DensityScale {
  return SCALES[density];
}
