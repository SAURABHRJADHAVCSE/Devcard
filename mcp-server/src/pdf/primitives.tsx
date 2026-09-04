import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { DensityScale } from "./density";
import { toBullets } from "./format";

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
  headerRule: "line" | "color"; // "line": black border-bottom (ATS-plainest). "color": colored text, no border.
}

export const ATS_THEME: ResumeTheme = { ink: "#000000", muted: "#333333", accent: "#000000", headerRule: "line" };

interface Props {
  scale: DensityScale;
  theme: ResumeTheme;
}

export function useSharedStyles({ scale, theme }: Props) {
  return StyleSheet.create({
    page: {
      fontFamily: "Helvetica",
      fontSize: scale.fontSize.body,
      color: theme.ink,
      paddingVertical: scale.page.paddingVertical,
      paddingHorizontal: scale.page.paddingHorizontal,
      lineHeight: scale.lineHeight,
    },
    name: {
      fontFamily: "Helvetica-Bold",
      fontSize: scale.fontSize.name,
      color: theme.ink,
      marginBottom: scale.gap.afterName,
    },
    headline: {
      fontSize: scale.fontSize.headline,
      color: theme.muted,
      marginBottom: scale.gap.afterHeadline,
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
      fontFamily: "Helvetica-Bold",
      fontSize: scale.fontSize.sectionHeader,
      color: theme.headerRule === "color" ? theme.accent : theme.ink,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginTop: scale.gap.sectionTop,
      marginBottom: scale.gap.afterSectionHeader,
      ...(theme.headerRule === "line"
        ? { paddingBottom: 3, borderBottom: `1pt solid ${theme.ink}` }
        : {}),
    },
    entry: {
      marginBottom: scale.gap.betweenEntries,
    },
    entryTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    entryTitle: {
      fontFamily: "Helvetica-Bold",
      fontSize: scale.fontSize.entryTitle,
      color: theme.ink,
    },
    entryMeta: {
      fontSize: scale.fontSize.small,
      color: theme.muted,
      marginBottom: scale.gap.withinEntry,
    },
    entryDates: {
      fontSize: scale.fontSize.small,
      color: theme.muted,
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
      fontFamily: "Helvetica-Bold",
      color: theme.headerRule === "color" ? theme.accent : theme.ink,
    },
  });
}

export function SectionHeader({ children, styles }: { children: string; styles: ReturnType<typeof useSharedStyles> }) {
  return <Text style={styles.sectionHeader}>{children}</Text>;
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
