import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { FullProfile } from "../../db/get-full-profile";
import { parseJsonArray, SKILL_CATEGORY_LABELS, dateRange } from "../format";
import { ATS_THEME, useSharedStyles, SectionHeader, BulletList, TechLine } from "../primitives";
import type { Density } from "../density";
import { getDensityScale } from "../density";

// ATS (Applicant Tracking System) parsers read a PDF's text left-to-right,
// top-to-bottom, in the order it's drawn. Every rule here exists to keep
// that reading order linear and unambiguous:
// - Single column only — no side-by-side sections (a sidebar + main body
//   often gets read as one interleaved, scrambled column of text).
// - Base-14 "Helvetica" — always embedded in the PDF viewer/parser itself,
//   no font subsetting quirks that can occasionally trip up text extraction.
// - No tables, no icons-as-content, no text inside images.
// - Section headers are literal uppercase strings (not CSS text-transform)
//   with a plain rule beneath — the embedded text matches what's on screen
//   regardless of how a given parser handles CSS transforms.
// - Reading order: Name, Title, Contact, Summary, Experience, Skills,
//   Projects, Education, Certifications.
export function AtsResume({ full, density = "comfortable" }: { full: FullProfile; density?: Density }) {
  const styles = useSharedStyles({ scale: getDensityScale(density), theme: ATS_THEME });
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
              return (
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
