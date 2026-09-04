import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { DensityScale } from "./density";
import { toBullets, parseInlineBold } from "./format";

// @react-pdf/renderer exports its Style/StyleProp type via `export =`,
// which TS can't cleanly name here (its Text component is overloaded for
// SVG text too, so deriving off ComponentProps pulls in an unrelated SVG
// variant) — same awkwardness registry.ts notes for PdfDocument. `any` is
// the pragmatic escape hatch other callers already pass StyleSheet.create
// results or plain style objects through.
type TextStyleProp = any; // eslint-disable-line @typescript-eslint/no-explicit-any

// Every template builds on these. They encode the ATS-safety rules once —
// single-column flow, real text (no icons standing in for content), a
// title/company/location/dates line followed by real bullet <Text> nodes,
// section headers as plain bold text — so an individual template can only
// vary color/spacing/accent, never the underlying document structure or
// reading order.

export interface ResumeTheme {
  ink: string;
  muted: string;
  accent: string;
  // "line": black border-bottom (ATS-plainest). "color": colored text, no
  // border. "both": colored text + a colored border — a styled option that
  // still keeps a clear rule under each heading.
  headerRule: "line" | "color" | "both";
  // Base-14 ("Helvetica"/"Times-Roman" + their distinct "-Bold" PostScript
  // names) is the zero-risk default — always embedded by every PDF viewer/
  // parser already, no subsetting risk. "Inter" is the one deliberate
  // exception (see setup.ts for why WOFF specifically, and the extraction
  // verification behind it) — it registers one family at two weights rather
  // than two distinct family names, so a theme using it must also set
  // fontWeightBold (typically 700); see resolveBoldStyle below for how the
  // two schemes both resolve correctly.
  fontFamily?: "Helvetica" | "Times-Roman" | "Inter";
  fontFamilyBold?: "Helvetica-Bold" | "Times-Bold" | "Inter";
  fontWeightBold?: number;
  // Section headers default to a literal uppercase string (ATS-safe: the
  // embedded text matches what's on screen regardless of how a given parser
  // handles CSS transforms). A styled, non-ATS template can opt into
  // sentence case — still safe there since it passes its own literally-cased
  // heading text in, never relying on this transform to produce it.
  sectionHeaderCase?: "uppercase" | "none";
}

export const ATS_THEME: ResumeTheme = { ink: "#000000", muted: "#333333", accent: "#000000", headerRule: "line" };

// Base-14 bold ("Helvetica-Bold") is a distinct PostScript name — just set
// fontFamily to it. An embedded multi-weight family ("Inter") is one
// registered family resolved by fontWeight instead — same family name as
// regular, plus an explicit weight. Centralized here so useSharedStyles and
// any template needing bold outside the shared styles (InlineBoldText's
// nested spans) resolve it identically.
export function resolveBoldStyle(theme: ResumeTheme): { fontFamily: string; fontWeight?: number } {
  const fontFamily = theme.fontFamilyBold ?? "Helvetica-Bold";
  return theme.fontWeightBold ? { fontFamily, fontWeight: theme.fontWeightBold } : { fontFamily };
}

interface Props {
  scale: DensityScale;
  theme: ResumeTheme;
}

export function useSharedStyles({ scale, theme }: Props) {
  const regular = theme.fontFamily ?? "Helvetica";
  const boldStyle = resolveBoldStyle(theme);

  return StyleSheet.create({
    page: {
      fontFamily: regular,
      fontSize: scale.fontSize.body,
      color: theme.ink,
      paddingVertical: scale.page.paddingVertical,
      paddingHorizontal: scale.page.paddingHorizontal,
      lineHeight: scale.lineHeight,
    },
    name: {
      ...boldStyle,
      fontSize: scale.fontSize.name,
      color: theme.ink,
      marginBottom: scale.gap.afterName,
      // Fixed, generous line-height regardless of density — the page-wide
      // scale.lineHeight is tuned for compact multi-line body text, and is
      // too tight for a single large bold heading: at veryCompact (1.16) a
      // 17pt bold glyph's descenders can visually crowd the line below it.
      lineHeight: 1.3,
    },
    headline: {
      fontSize: scale.fontSize.headline,
      color: theme.muted,
      marginBottom: scale.gap.afterHeadline,
      lineHeight: 1.3,
    },
    contactLine: {
      fontSize: scale.fontSize.small,
      color: theme.muted,
      marginBottom: scale.gap.afterContact,
    },
    summary: {
      fontSize: scale.fontSize.body,
      color: theme.ink,
      marginBottom: scale.gap.afterSummary,
    },
    sectionHeader: {
      ...boldStyle,
      fontSize: scale.fontSize.sectionHeader,
      color: theme.headerRule === "color" || theme.headerRule === "both" ? theme.accent : theme.ink,
      textTransform: theme.sectionHeaderCase === "none" ? "none" : "uppercase",
      letterSpacing: 0.6,
      marginTop: scale.gap.sectionTop,
      marginBottom: scale.gap.afterSectionHeader,
      ...(theme.headerRule === "line"
        ? { paddingBottom: 3, borderBottom: `1pt solid ${theme.ink}` }
        : {}),
      ...(theme.headerRule === "both"
        ? { paddingBottom: 3, borderBottom: `1pt solid ${theme.accent}` }
        : {}),
    },
    entry: {
      marginBottom: scale.gap.betweenEntries,
    },
    entryTitle: {
      ...boldStyle,
      fontSize: scale.fontSize.entryTitle,
      color: theme.ink,
      lineHeight: 1.25, // same reasoning as name/headline — a wrapped long title needs breathing room
    },
    entryMeta: {
      fontSize: scale.fontSize.small,
      color: theme.muted,
      marginBottom: scale.gap.withinEntry,
    },
    bullet: {
      fontSize: scale.fontSize.body,
      color: theme.ink,
      marginTop: scale.gap.betweenBullets,
      paddingLeft: 10,
    },
    entryTech: {
      fontSize: scale.fontSize.small,
      color: theme.headerRule === "color" ? theme.accent : theme.muted,
      marginTop: scale.gap.betweenBullets,
    },
    skillLine: {
      fontSize: scale.fontSize.body,
      color: theme.ink,
      marginBottom: scale.gap.withinEntry,
    },
    skillLabel: {
      ...boldStyle,
      color: theme.headerRule === "color" ? theme.accent : theme.ink,
    },
  });
}

export function SectionHeader({ children, styles }: { children: string; styles: ReturnType<typeof useSharedStyles> }) {
  return <Text style={styles.sectionHeader}>{children}</Text>;
}

// Title on its own line, meta (location · dates) on the next. Deliberately
// NOT a flex row with the title on the left and dates pinned right, for two
// independently confirmed reasons:
// - Visual: a long job title (verified with a 100+ character title) wraps
//   to two lines, and a sibling positioned by justifyContent: "space-between"
//   on that same row can visually collide with the wrapped second line.
// - ATS extraction (the more serious one): even a row built with correct
//   flexGrow/flexShrink/flexBasis to avoid the visual collision above still
//   corrupts *reading order* — verified by rendering a real test row and
//   running plain `pdftotext` (no -layout) on it, which is closer to how
//   many real ATS parsers walk a PDF's content stream. Every right-aligned
//   date column got deferred to the very end of the document, orphaned from
//   its entry, while the title text extracted in the right place. Stacking
//   is unconditionally safe on both counts at any content length.
export function EntryHeading({
  title,
  meta,
  styles,
}: {
  title: React.ReactNode;
  meta?: React.ReactNode;
  styles: ReturnType<typeof useSharedStyles>;
}) {
  return (
    <>
      <Text style={styles.entryTitle}>{title}</Text>
      {meta && <Text style={styles.entryMeta}>{meta}</Text>}
    </>
  );
}

// Real text bullets ("• line") — never SVG shapes, never images. Falls back
// to nothing if the description is empty (no orphan bullet).
export function BulletList({ text, styles }: { text: string | null; styles: ReturnType<typeof useSharedStyles> }) {
  const bullets = toBullets(text);
  if (bullets.length === 0) return null;
  return (
    <>
      {bullets.map((line, i) => (
        <Text key={i} style={styles.bullet}>
          • {line}
        </Text>
      ))}
    </>
  );
}

export function TechLine({ tech, styles }: { tech: string[]; styles: ReturnType<typeof useSharedStyles> }) {
  if (tech.length === 0) return null;
  return <Text style={styles.entryTech}>Technologies: {tech.join(", ")}</Text>;
}

// Opt-in emphasis variants of the plain text/bullet primitives above — used
// only by templates that want **bold**-marked spans rendered as real bold
// text (see format.ts:parseInlineBold). Separate components rather than new
// params on Text/BulletList so every existing template's plain-text
// rendering is untouched.
export function InlineBoldText({
  text,
  style,
  boldStyle,
}: {
  text: string;
  style: TextStyleProp;
  boldStyle: TextStyleProp;
}) {
  const segments = parseInlineBold(text);
  return (
    <Text style={style}>
      {segments.map((seg, i) =>
        seg.bold ? (
          <Text key={i} style={boldStyle}>
            {seg.text}
          </Text>
        ) : (
          seg.text
        ),
      )}
    </Text>
  );
}

export function InlineBoldBulletList({
  text,
  styles,
  boldStyle,
}: {
  text: string | null;
  styles: ReturnType<typeof useSharedStyles>;
  boldStyle: TextStyleProp;
}) {
  const bullets = toBullets(text);
  if (bullets.length === 0) return null;
  return (
    <>
      {bullets.map((line, i) => {
        const segments = parseInlineBold(line);
        return (
          <Text key={i} style={styles.bullet}>
            •{" "}
            {segments.map((seg, j) =>
              seg.bold ? (
                <Text key={j} style={boldStyle}>
                  {seg.text}
                </Text>
              ) : (
                seg.text
              ),
            )}
          </Text>
        );
      })}
    </>
  );
}
