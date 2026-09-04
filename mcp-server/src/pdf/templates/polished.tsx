import { Fragment } from "react";
import { Document, Page, View, Text, Link } from "@react-pdf/renderer";
import type { FullProfile } from "../../db/get-full-profile";
import { parseJsonArray, SKILL_CATEGORY_LABELS, dateRange, normalizeUrl } from "../format";
import {
  useSharedStyles,
  resolveBoldStyle,
  SectionHeader,
  EntryHeading,
  InlineBoldText,
  InlineBoldBulletList,
  TechLine,
  type ResumeTheme,
} from "../primitives";
import type { Density } from "../density";
import { getDensityScale } from "../density";
import "../setup"; // registers the embedded Inter font this theme uses — see setup.ts for why WOFF specifically, and the extraction verification behind it

// Centered header, navy-blue accents, colored section-header rules, and
// **bold**-emphasized bullets. Section order and heading names follow
// standard resume-design guidance for developer resumes: technical skills
// surfaced near the top (right after the summary, ahead of experience) and
// standard/recognizable headings ("Professional Summary", "Work
// Experience"). Real clickable hyperlinks on the header links and project
// URLs. Title/dates are stacked, not a right-aligned row — see
// primitives.tsx:EntryHeading for why a row (tried and measured here first)
// corrupts ATS reading order even when it looks fine on screen.
//
// Inter, embedded (not base-14) — a deliberate, verified exception; see
// setup.ts. Every other (currently dormant) template still defaults to
// Helvetica with zero embedding risk — this is the one template that opted
// in, by explicit request.
const POLISHED_THEME: ResumeTheme = {
  ink: "#1a1a1a",
  muted: "#555555",
  accent: "#1a2e4a", // dark navy — reserved for section headers and real links, not general body text
  headerRule: "both",
  sectionHeaderCase: "none",
  fontFamily: "Inter",
  fontFamilyBold: "Inter",
  fontWeightBold: 700,
};

const boldStyle = resolveBoldStyle(POLISHED_THEME);

export function PolishedResume({ full, density = "comfortable" }: { full: FullProfile; density?: Density }) {
  const styles = useSharedStyles({ scale: getDensityScale(density), theme: POLISHED_THEME });
  const { profile: p, skills, experiences, projects, education, certifications } = full;

  const contactParts = [p?.email, p?.phone, p?.location].filter((v): v is string => Boolean(v));
  const linkUrls = [p?.website, p?.github, p?.linkedin].filter((v): v is string => Boolean(v));

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
            <Text style={[styles.headline, { textAlign: "center", color: POLISHED_THEME.accent, ...boldStyle }]}>
              {p.headline}
            </Text>
          )}
          {(contactParts.length > 0 || linkUrls.length > 0) && (
            // One line for everything (contact facts + links) per standard
            // convention — was two lines earlier; links stay real
            // hyperlinks in accent color, inline with the plain facts.
            <Text style={[styles.contactLine, { textAlign: "center" }]}>
              {contactParts.map((part, i) => (
                <Fragment key={`fact-${part}`}>
                  {i > 0 && "   ·   "}
                  {part}
                </Fragment>
              ))}
              {contactParts.length > 0 && linkUrls.length > 0 && "   ·   "}
              {linkUrls.map((url, i) => (
                <Fragment key={url}>
                  {i > 0 && "   ·   "}
                  <Link src={normalizeUrl(url)} style={{ color: POLISHED_THEME.accent }}>
                    {url}
                  </Link>
                </Fragment>
              ))}
            </Text>
          )}
        </View>

        {p?.bio && (
          <View>
            <SectionHeader styles={styles}>Professional Summary</SectionHeader>
            <InlineBoldText text={p.bio} style={styles.summary} boldStyle={boldStyle} />
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

        {experiences.length > 0 && (
          <View>
            <SectionHeader styles={styles}>Work Experience</SectionHeader>
            {experiences.map((e) => {
              const meta = [e.location, dateRange(e.startDate, e.endDate, e.isCurrent)].filter(Boolean).join("   ·   ");
              return (
                <View key={e.id} style={styles.entry} wrap={false}>
                  <EntryHeading title={`${e.role} — ${e.company}`} meta={meta} styles={styles} />
                  <InlineBoldBulletList text={e.description} styles={styles} boldStyle={boldStyle} />
                  <TechLine tech={parseJsonArray(e.techUsed)} styles={styles} />
                </View>
              );
            })}
          </View>
        )}

        {projects.length > 0 && (
          <View>
            <SectionHeader styles={styles}>Projects</SectionHeader>
            {projects.map((proj) => {
              const title = proj.url ? (
                <>
                  {proj.name}{" "}
                  <Link src={normalizeUrl(proj.url)} style={{ color: POLISHED_THEME.accent }}>
                    {proj.url}
                  </Link>
                </>
              ) : (
                proj.name
              );
              return (
                <View key={proj.id} style={styles.entry} wrap={false}>
                  <EntryHeading title={title} meta={dateRange(proj.startDate, proj.endDate)} styles={styles} />
                  <InlineBoldBulletList text={proj.description} styles={styles} boldStyle={boldStyle} />
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
              const years = [ed.startYear, ed.endYear].filter(Boolean).join(" – ");
              const meta = [degreeLine !== ed.institution ? ed.institution : null, years].filter(Boolean).join("   ·   ");
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
            <SectionHeader styles={styles}>Certifications</SectionHeader>
            {certifications.map((c) => (
              <Text key={c.id} style={styles.skillLine}>
                {c.name}
                {c.issuer ? ` — ${c.issuer}` : ""}
                {c.issuedDate ? ` (${c.issuedDate}${c.expiresDate ? ` – ${c.expiresDate}` : ""})` : ""}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
