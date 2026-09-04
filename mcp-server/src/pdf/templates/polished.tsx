import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { FullProfile } from "../../db/get-full-profile";
import { parseJsonArray, SKILL_CATEGORY_LABELS, dateRange } from "../format";
import { useSharedStyles, SectionHeader, InlineBoldText, InlineBoldBulletList, TechLine, type ResumeTheme } from "../primitives";
import type { Density } from "../density";
import { getDensityScale } from "../density";

// Modeled on a polished, centered-header resume format: bold centered name,
// a colored subtitle/contact block, colored section-header rules, and
// **bold**-emphasized bullets. Same underlying data and single-column flow
// as every other template — a styled, non-ATS option (color-dependent
// headers) alongside Modern/Executive, not a replacement for ATS Simple or
// Classic.
const POLISHED_THEME: ResumeTheme = {
  ink: "#1a1a1a",
  muted: "#5b5b5b",
  accent: "#1d4ed8",
  headerRule: "both",
  sectionHeaderCase: "none",
};

const BOLD_FONT = "Helvetica-Bold"; // POLISHED_THEME doesn't override fontFamily, so this matches useSharedStyles' default bold face

export function PolishedResume({ full, density = "comfortable" }: { full: FullProfile; density?: Density }) {
  const styles = useSharedStyles({ scale: getDensityScale(density), theme: POLISHED_THEME });
  const { profile: p, skills, experiences, projects, education, certifications } = full;

  const contactFacts = [p?.email, p?.phone, p?.location].filter(Boolean).join("   ·   ");
  const links = [p?.website, p?.github, p?.linkedin].filter(Boolean).join("   ·   ");

  const byCategory = new Map<string, string[]>();
  for (const skill of skills) {
    const list = byCategory.get(skill.category) ?? [];
    list.push(skill.name);
    byCategory.set(skill.category, list);
  }

  return (
    <Document
      title={p?.name ? `${p.name} Resume` : "Resume"}
      author={p?.name || undefined}
      creator=""
      producer=""
      subject="Resume"
    >
      <Page size="A4" style={styles.page}>
        <View style={{ alignItems: "center" }}>
          <Text style={[styles.name, { textAlign: "center" }]}>{p?.name || "Untitled Profile"}</Text>
          {p?.headline && (
            <Text style={[styles.headline, { textAlign: "center", color: POLISHED_THEME.accent, fontFamily: BOLD_FONT }]}>
              {p.headline}
            </Text>
          )}
          {contactFacts.length > 0 && <Text style={[styles.contactLine, { textAlign: "center" }]}>{contactFacts}</Text>}
          {links.length > 0 && (
            <Text style={[styles.contactLine, { textAlign: "center", color: POLISHED_THEME.accent }]}>{links}</Text>
          )}
        </View>

        {p?.bio && (
          <View>
            <SectionHeader styles={styles}>Summary</SectionHeader>
            <InlineBoldText text={p.bio} style={styles.summary} boldFontFamily={BOLD_FONT} />
          </View>
        )}

        {experiences.length > 0 && (
          <View>
            <SectionHeader styles={styles}>Experience</SectionHeader>
            {experiences.map((e) => {
              const dates = dateRange(e.startDate, e.endDate, e.isCurrent);
              return (
                <View key={e.id} style={styles.entry} wrap={false}>
                  <Text style={styles.entryTitle}>
                    {e.role} — {e.company}
                  </Text>
                  {(e.location || dates) && (
                    <Text style={styles.entryMeta}>
                      {e.location}
                      {e.location && dates ? "   ·   " : ""}
                      {dates && <Text style={{ color: POLISHED_THEME.accent }}>{dates}</Text>}
                    </Text>
                  )}
                  <InlineBoldBulletList text={e.description} styles={styles} boldFontFamily={BOLD_FONT} />
                  <TechLine tech={parseJsonArray(e.techUsed)} styles={styles} />
                </View>
              );
            })}
          </View>
        )}

        {skills.length > 0 && (
          <View>
            <SectionHeader styles={styles}>Skills</SectionHeader>
            {[...byCategory.entries()].map(([category, names]) => (
              <Text key={category} style={styles.skillLine}>
                <Text style={styles.skillLabel}>{SKILL_CATEGORY_LABELS[category] ?? category}: </Text>
                {names.join(", ")}
              </Text>
            ))}
          </View>
        )}

        {projects.length > 0 && (
          <View>
            <SectionHeader styles={styles}>Projects</SectionHeader>
            {projects.map((proj) => {
              const dates = dateRange(proj.startDate, proj.endDate);
              return (
                <View key={proj.id} style={styles.entry} wrap={false}>
                  <Text style={styles.entryTitle}>
                    {proj.name}
                    {proj.url && <Text style={{ color: POLISHED_THEME.accent }}> — {proj.url}</Text>}
                  </Text>
                  {dates && <Text style={[styles.entryMeta, { color: POLISHED_THEME.accent }]}>{dates}</Text>}
                  <InlineBoldBulletList text={proj.description} styles={styles} boldFontFamily={BOLD_FONT} />
                  <TechLine tech={parseJsonArray(proj.tech)} styles={styles} />
                </View>
              );
            })}
          </View>
        )}

        {education.length > 0 && (
          <View>
            <SectionHeader styles={styles}>Education</SectionHeader>
            {education.map((ed) => {
              const degreeLine = [ed.degree, ed.field].filter(Boolean).join(" in ") || ed.institution;
              const institutionLine = degreeLine !== ed.institution ? ed.institution : "";
              const years = [ed.startYear, ed.endYear].filter(Boolean).join(" – ");
              return (
                <View key={ed.id} style={styles.entry} wrap={false}>
                  <Text style={styles.entryTitle}>{degreeLine}</Text>
                  {(institutionLine || years) && (
                    <Text style={styles.entryMeta}>
                      {institutionLine}
                      {institutionLine && years ? "   ·   " : ""}
                      {years && <Text style={{ color: POLISHED_THEME.accent }}>{years}</Text>}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {certifications.length > 0 && (
          <View>
            <SectionHeader styles={styles}>Certifications</SectionHeader>
            {certifications.map((c) => (
              <Text key={c.id} style={styles.skillLine}>
                {c.name}
                {c.issuer ? ` — ${c.issuer}` : ""}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
