import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { FullProfile } from "../../db/get-full-profile";
import { parseJsonArray, SKILL_CATEGORY_LABELS, dateRange } from "../format";

// ATS (Applicant Tracking System) parsers read a PDF's text left-to-right,
// top-to-bottom, in the order it's drawn. Every rule here exists to keep
// that reading order linear and unambiguous:
// - Single column only — no side-by-side sections (a sidebar + main body
//   often gets read as one interleaved, scrambled column of text).
// - Base-14 "Helvetica" — always embedded in the PDF viewer/parser itself,
//   no font subsetting quirks that can occasionally trip up text extraction.
// - No tables, no icons-as-content, no text inside images.
// - Section headers are plain bold text with a rule beneath, not colored
//   badges — screen-reader-plain, so a parser reads them as headers, not
//   decoration to discard.
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10.5,
    color: "#000000",
    paddingVertical: 36,
    paddingHorizontal: 42,
    lineHeight: 1.4,
  },
  name: {
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    marginBottom: 3,
  },
  headline: {
    fontSize: 11,
    marginBottom: 6,
  },
  contactLine: {
    fontSize: 9.5,
    marginBottom: 12,
  },
  bio: {
    fontSize: 10,
    marginBottom: 14,
  },
  sectionHeader: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottom: "1pt solid #000000",
  },
  entry: {
    marginBottom: 9,
  },
  entryTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  entryTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
  },
  entryDates: {
    fontSize: 9.5,
  },
  entrySubtitle: {
    fontSize: 10,
    marginBottom: 2,
  },
  entryBody: {
    fontSize: 10,
    marginTop: 2,
  },
  entryTech: {
    fontSize: 9,
    marginTop: 2,
    color: "#333333",
  },
  skillLine: {
    fontSize: 10,
    marginBottom: 2,
  },
  skillLabel: {
    fontFamily: "Helvetica-Bold",
  },
});

export function AtsResume({ full }: { full: FullProfile }) {
  const { profile: p, skills, experiences, projects, education, certifications } = full;

  const contact = [p?.email, p?.phone, p?.location, p?.website, p?.github, p?.linkedin]
    .filter(Boolean)
    .join("   |   ");

  const byCategory = new Map<string, string[]>();
  for (const skill of skills) {
    const list = byCategory.get(skill.category) ?? [];
    list.push(skill.name);
    byCategory.set(skill.category, list);
  }

  return (
    <Document title={`${p?.name ?? "Resume"} — Resume`} author={p?.name ?? undefined}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{p?.name || "Untitled Profile"}</Text>
        {p?.headline && <Text style={styles.headline}>{p.headline}</Text>}
        {contact.length > 0 && <Text style={styles.contactLine}>{contact}</Text>}
        {p?.bio && <Text style={styles.bio}>{p.bio}</Text>}

        {skills.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>Skills</Text>
            {[...byCategory.entries()].map(([category, names]) => (
              <Text key={category} style={styles.skillLine}>
                <Text style={styles.skillLabel}>{SKILL_CATEGORY_LABELS[category] ?? category}: </Text>
                {names.join(", ")}
              </Text>
            ))}
          </View>
        )}

        {experiences.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>Experience</Text>
            {experiences.map((e) => (
              <View key={e.id} style={styles.entry} wrap={false}>
                <View style={styles.entryTitleRow}>
                  <Text style={styles.entryTitle}>
                    {e.role} — {e.company}
                  </Text>
                  <Text style={styles.entryDates}>{dateRange(e.startDate, e.endDate, e.isCurrent)}</Text>
                </View>
                {e.description && <Text style={styles.entryBody}>{e.description}</Text>}
                {parseJsonArray(e.techUsed).length > 0 && (
                  <Text style={styles.entryTech}>Technologies: {parseJsonArray(e.techUsed).join(", ")}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {projects.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>Projects</Text>
            {projects.map((proj) => (
              <View key={proj.id} style={styles.entry} wrap={false}>
                <Text style={styles.entryTitle}>{proj.name}</Text>
                {proj.description && <Text style={styles.entryBody}>{proj.description}</Text>}
                {parseJsonArray(proj.tech).length > 0 && (
                  <Text style={styles.entryTech}>Technologies: {parseJsonArray(proj.tech).join(", ")}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {education.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>Education</Text>
            {education.map((ed) => (
              <View key={ed.id} style={styles.entry} wrap={false}>
                <View style={styles.entryTitleRow}>
                  <Text style={styles.entryTitle}>{[ed.degree, ed.field].filter(Boolean).join(" in ")}</Text>
                  <Text style={styles.entryDates}>
                    {[ed.startYear, ed.endYear].filter(Boolean).join(" – ")}
                  </Text>
                </View>
                <Text style={styles.entrySubtitle}>{ed.institution}</Text>
              </View>
            ))}
          </View>
        )}

        {certifications.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>Certifications</Text>
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
