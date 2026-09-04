import { eq, sql } from "drizzle-orm";
import { db } from "./client";
import { skills, projects, experiences, education, profile } from "./schema";
import type { Delta } from "../ai/delta-schema";

// Applies an already-validated delta to the DB and returns a human-readable
// summary of what changed, for the "✓ Added: X" style diff the chat UI shows.
export async function applyDelta(delta: Delta): Promise<string[]> {
  const summary: string[] = [];

  for (const skill of delta.addSkills ?? []) {
    const [existing] = await db
      .select()
      .from(skills)
      .where(sql`lower(${skills.name}) = lower(${skill.name})`)
      .limit(1);
    if (existing) continue;
    await db.insert(skills).values({
      name: skill.name,
      category: skill.category,
      level: skill.level,
      yearsOfExperience: skill.years,
    });
    summary.push(`Added skill: ${skill.name} (${skill.category})`);
  }

  for (const project of delta.addProjects ?? []) {
    await db.insert(projects).values({
      name: project.name,
      description: project.description,
      url: project.url,
      github: project.github,
      tech: project.tech ? JSON.stringify(project.tech) : null,
      featured: project.featured ?? false,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
    });
    summary.push(`Added project: ${project.name}`);
  }

  for (const exp of delta.addExperiences ?? []) {
    await db.insert(experiences).values({
      company: exp.company,
      role: exp.role,
      description: exp.description,
      location: exp.location,
      employmentType: exp.employmentType,
      techUsed: exp.techUsed ? JSON.stringify(exp.techUsed) : null,
      startDate: exp.startDate,
      endDate: exp.endDate,
      isCurrent: exp.isCurrent,
    });
    summary.push(`Added experience: ${exp.role} at ${exp.company}`);
  }

  for (const edu of delta.addEducation ?? []) {
    await db.insert(education).values(edu);
    summary.push(`Added education: ${edu.institution}`);
  }

  if (delta.profileUpdates && Object.keys(delta.profileUpdates).length > 0) {
    const [exists] = await db.select().from(profile).where(eq(profile.id, "me")).limit(1);
    if (exists) {
      await db.update(profile).set(delta.profileUpdates).where(eq(profile.id, "me"));
    } else {
      await db.insert(profile).values({ ...delta.profileUpdates, id: "me", name: delta.profileUpdates.name ?? "" });
    }
    summary.push(`Updated profile: ${Object.keys(delta.profileUpdates).join(", ")}`);
  }

  return summary;
}
