import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { FullProfile } from "../../db/get-full-profile";
import { parseJsonArray, SKILL_CATEGORY_LABELS, dateRange } from "../format";
import { useSharedStyles, SectionHeader, BulletList, TechLine, type ResumeTheme } from "../primitives";
import type { Density } from "../density";
import { getDensityScale } from "../density";

const MODERN_THEME: ResumeTheme = { ink: "#0f172a", muted: "#64748b", accent: "#4f46e5", headerRule: "color" };

// Same shared primitives and structure as ats.tsx — this is a color reskin,
// not a layout change, so it stays reasonably parseable even though "ats"
// is the template to pick when ATS-friendliness is the priority.
export function ModernResume({ full, density = "comfortable" }: { full: FullProfile; density?: Density }) {
  const styles = useSharedStyles({ scale: getDensityScale(density), theme: MODERN_THEME });
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
            {experiences.map((e) => (
              <View key={e.id} style={styles.entry} wrap={false}>
                <View style={styles.entryTitleRow}>
                  <Text style={styles.entryTitle}>
                    {e.role}, {e.company}
                  </Text>
                  <Text style={styles.entryDates}>{dateRange(e.startDate, e.endDate, e.isCurrent)}</Text>
                </View>
                {e.location && <Text style={styles.entryMeta}>{e.location}</Text>}
                <BulletList text={e.description} styles={styles} />
                <TechLine tech={parseJsonArray(e.techUsed)} styles={styles} />
              </View>
            ))}
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
            {education.map((ed) => (
              <View key={ed.id} style={styles.entry} wrap={false}>
                <View style={styles.entryTitleRow}>
                  <Text style={styles.entryTitle}>{[ed.degree, ed.field].filter(Boolean).join(" in ")}</Text>
                  <Text style={styles.entryDates}>{[ed.startYear, ed.endYear].filter(Boolean).join(" – ")}</Text>
                </View>
                <Text style={styles.entryMeta}>{ed.institution}</Text>
              </View>
            ))}
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
