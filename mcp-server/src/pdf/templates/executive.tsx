import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { FullProfile } from "../../db/get-full-profile";
import { parseJsonArray, SKILL_CATEGORY_LABELS, dateRange } from "../format";
import { useSharedStyles, SectionHeader, EntryHeading, BulletList, TechLine, type ResumeTheme } from "../primitives";
import type { Density } from "../density";
import { getDensityScale } from "../density";

const EXECUTIVE_THEME: ResumeTheme = { ink: "#111827", muted: "#6b7280", accent: "#1e293b", headerRule: "color" };

// Same structure as every other template — dark slate accent instead of
// Modern's indigo, for a more understated/senior-leadership feel. Like
// Modern, this is the styled option, not the ATS-optimized one; pick "ats"
// or "classic" when parseability is the priority.
export function ExecutiveResume({ full, density = "comfortable" }: { full: FullProfile; density?: Density }) {
  const styles = useSharedStyles({ scale: getDensityScale(density), theme: EXECUTIVE_THEME });
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
    <Document
      title={p?.name ? `${p.name} Resume` : "Resume"}
      author={p?.name || undefined}
      creator=""
      producer=""
      subject="Resume"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{p?.name || "Untitled Profile"}</Text>
        {p?.headline && <Text style={styles.headline}>{p.headline}</Text>}
        {contact.length > 0 && <Text style={styles.contactLine}>{contact}</Text>}
        {p?.bio && <Text style={styles.summary}>{p.bio}</Text>}

        {experiences.length > 0 && (
          <View>
            <SectionHeader styles={styles}>WORK EXPERIENCE</SectionHeader>
            {experiences.map((e) => {
              const meta = [e.location, dateRange(e.startDate, e.endDate, e.isCurrent)].filter(Boolean).join("   ·   ");
              return (
                <View key={e.id} style={styles.entry} wrap={false}>
                  <EntryHeading title={`${e.role}, ${e.company}`} meta={meta} styles={styles} />
                  <BulletList text={e.description} styles={styles} />
                  <TechLine tech={parseJsonArray(e.techUsed)} styles={styles} />
                </View>
              );
            })}
          </View>
        )}

        {skills.length > 0 && (
          <View>
            <SectionHeader styles={styles}>SKILLS</SectionHeader>
            {[...byCategory.entries()].map(([category, names]) => (
              <Text key={category} style={styles.skillLine}>
                <Text style={styles.skillLabel}>{(SKILL_CATEGORY_LABELS[category] ?? category).toUpperCase()}: </Text>
                {names.join(", ")}
              </Text>
            ))}
          </View>
        )}

        {projects.length > 0 && (
          <View>
            <SectionHeader styles={styles}>PROJECTS</SectionHeader>
            {projects.map((proj) => (
              <View key={proj.id} style={styles.entry} wrap={false}>
                <Text style={styles.entryTitle}>{proj.name}</Text>
                <BulletList text={proj.description} styles={styles} />
                <TechLine tech={parseJsonArray(proj.tech)} styles={styles} />
              </View>
            ))}
          </View>
        )}

        {education.length > 0 && (
          <View>
            <SectionHeader styles={styles}>EDUCATION</SectionHeader>
            {education.map((ed) => {
              const degreeLine = [ed.degree, ed.field].filter(Boolean).join(" in ") || ed.institution;
              const meta = [degreeLine !== ed.institution ? ed.institution : null, [ed.startYear, ed.endYear].filter(Boolean).join(" – ")]
                .filter(Boolean)
                .join("   ·   ");
              return (
                <View key={ed.id} style={styles.entry} wrap={false}>
                  <EntryHeading title={degreeLine} meta={meta} styles={styles} />
                </View>
              );
            })}
          </View>
        )}

        {certifications.length > 0 && (
          <View>
            <SectionHeader styles={styles}>CERTIFICATIONS</SectionHeader>
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
