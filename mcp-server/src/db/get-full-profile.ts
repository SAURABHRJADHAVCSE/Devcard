import { eq } from "drizzle-orm";
import { db } from "./client";
import { profile, skills, experiences, projects, education, certifications } from "./schema";

export type FullProfile = {
  profile: typeof profile.$inferSelect | undefined;
  skills: (typeof skills.$inferSelect)[];
  experiences: (typeof experiences.$inferSelect)[];
  projects: (typeof projects.$inferSelect)[];
  education: (typeof education.$inferSelect)[];
  certifications: (typeof certifications.$inferSelect)[];
};

// Single place that joins all profile tables — used by the get_full_profile
// tool, the profile:// resources, and the HTTP GET /api/profile route, so
// the shape returned to every client stays identical.
export async function getFullProfile(): Promise<FullProfile> {
  const [profileRow, skillRows, experienceRows, projectRows, educationRows, certRows] = await Promise.all([
    db
      .select()
      .from(profile)
      .where(eq(profile.id, "me"))
      .limit(1)
      .then((rows) => rows[0]),
    db.select().from(skills),
    db.select().from(experiences),
    db.select().from(projects),
    db.select().from(education),
    db.select().from(certifications),
  ]);

  return {
    profile: profileRow,
    skills: skillRows,
    experiences: experienceRows,
    projects: projectRows,
    education: educationRows,
    certifications: certRows,
  };
}

const SKILL_CATEGORY_LABELS: Record<string, string> = {
  language: "Languages",
  framework: "Frameworks",
  tool: "Tools",
  cloud: "Cloud",
  soft: "Soft skills",
};

// Every element pushed here is a complete, self-contained Markdown block
// (a heading, a paragraph, or a whole list) — blocks join with a blank line
// between them so CommonMark renders them as separate paragraphs, not
// soft-wrapped continuations of the previous line.
export function formatResumeMarkdown(full: FullProfile): string {
  const blocks: string[] = [];
  const p = full.profile;

  const header = [`# ${p?.name ?? "Untitled Profile"}`];
  if (p?.headline) header.push(`*${p.headline}*`);
  const contact = [p?.email, p?.phone, p?.location, p?.website, p?.github, p?.linkedin].filter(Boolean);
  if (contact.length) header.push(contact.join(" · "));
  blocks.push(header.join("  \n")); // trailing double-space forces a hard line break within the header
  if (p?.bio) blocks.push(p.bio);

  if (full.experiences.length) {
    blocks.push("## Experience");
    for (const exp of full.experiences) {
      const range = `${exp.startDate} – ${exp.isCurrent ? "Present" : (exp.endDate ?? "")}`;
      const tech: string[] = exp.techUsed ? JSON.parse(exp.techUsed) : [];
      const entry = [`**${exp.role}**, ${exp.company} (${range})`];
      if (exp.description) entry.push(exp.description);
      if (tech.length) entry.push(`Tech: ${tech.join(", ")}`);
      blocks.push(entry.join("  \n"));
    }
  }

  if (full.projects.length) {
    blocks.push("## Projects");
    for (const proj of full.projects) {
      const tech: string[] = proj.tech ? JSON.parse(proj.tech) : [];
      const entry = [`**${proj.name}**${proj.url ? ` — ${proj.url}` : ""}`];
      if (proj.description) entry.push(proj.description);
      if (tech.length) entry.push(`Tech: ${tech.join(", ")}`);
      blocks.push(entry.join("  \n"));
    }
  }

  if (full.skills.length) {
    blocks.push("## Skills");
    const byCategory = new Map<string, string[]>();
    for (const skill of full.skills) {
      const list = byCategory.get(skill.category) ?? [];
      list.push(skill.name);
      byCategory.set(skill.category, list);
    }
    const list = [...byCategory.entries()].map(
      ([category, names]) => `- **${SKILL_CATEGORY_LABELS[category] ?? category}**: ${names.join(", ")}`,
    );
    blocks.push(list.join("\n"));
  }

  if (full.education.length) {
    blocks.push("## Education");
    const list = full.education.map((edu) => {
      const range = [edu.startYear, edu.endYear].filter(Boolean).join(" – ");
      return `- **${[edu.degree, edu.field].filter(Boolean).join(" in ")}**, ${edu.institution}${range ? ` (${range})` : ""}`;
    });
    blocks.push(list.join("\n"));
  }

  if (full.certifications.length) {
    blocks.push("## Certifications");
    const list = full.certifications.map((cert) => `- ${cert.name}${cert.issuer ? ` — ${cert.issuer}` : ""}`);
    blocks.push(list.join("\n"));
  }

  return blocks.join("\n\n");
}
