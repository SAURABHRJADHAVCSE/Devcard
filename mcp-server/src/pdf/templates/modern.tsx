import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { FullProfile } from "../../db/get-full-profile";
import { parseJsonArray, SKILL_CATEGORY_LABELS, dateRange } from "../format";

const BRAND = "#4f46e5";
const BRAND_LIGHT = "#eef2ff";
const INK = "#0f172a";
const MUTED = "#64748b";

// Same single-column, real-text structure as the ATS template — this is a
// visual reskin, not a layout change, so it stays reasonably parseable even
// though ATS-friendliness isn't the point of this one (use the "ats"
// template for that).
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10.5,
    color: INK,
    paddingVertical: 40,
    paddingHorizontal: 44,
    lineHeight: 1.4,
  },
  name: {
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    color: BRAND,
    marginBottom: 3,
  },
  headline: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 7,
  },
  contactLine: {
    fontSize: 9.5,
    color: MUTED,
    marginBottom: 14,
  },
  bio: {
    fontSize: 10,
    marginBottom: 16,
  },
  sectionHeader: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: BRAND,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 8,
  },
  entry: {
    marginBottom: 10,
    paddingLeft: 10,
    borderLeft: `2pt solid ${BRAND_LIGHT}`,
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
    color: MUTED,
  },
  entrySubtitle: {
    fontSize: 10,
    color: MUTED,
    marginBottom: 2,
  },
  entryBody: {
    fontSize: 10,
    marginTop: 2,
  },
  entryTech: {
    fontSize: 9,
    marginTop: 3,
    color: BRAND,
  },
  skillLine: {
    fontSize: 10,
    marginBottom: 3,
  },
  skillLabel: {
    fontFamily: "Helvetica-Bold",
    color: BRAND,
  },
});

export function ModernResume({ full }: { full: FullProfile }) {
  const { profile: p, skills, experiences, projects, education, certifications } = full;

  const contact = [p?.email, p?.phone, p?.location, p?.website, p?.github, p?.linkedin]
    .filter(Boolean)
    .join("   ·   ");

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
                  <Text style={styles.entryTech}>{parseJsonArray(e.techUsed).join("  ·  ")}</Text>
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
                  <Text style={styles.entryTech}>{parseJsonArray(proj.tech).join("  ·  ")}</Text>
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
