import { eq, sql } from "drizzle-orm";
import { db } from "./client";
import { skills, projects, experiences, education, certifications, profile } from "./schema";
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
    const [existingProject] = await db
      .select()
      .from(projects)
      .where(sql`lower(${projects.name}) = lower(${project.name})`)
      .limit(1);
    if (existingProject) continue;
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
    const [existingExp] = await db
      .select()
      .from(experiences)
      .where(sql`lower(${experiences.company}) = lower(${exp.company}) and lower(${experiences.role}) = lower(${exp.role})`)
      .limit(1);
    if (existingExp) {
      summary.push(`Skipped: "${exp.role}" at ${exp.company} already exists (id ${existingExp.id}) — describe it as an update instead ("rewrite my description at ...") to change it, not a new entry`);
      continue;
    }
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

  for (const patch of delta.updateExperiences ?? []) {
    const [existing] = await db
      .select()
      .from(experiences)
      .where(sql`lower(${experiences.company}) = lower(${patch.company}) and lower(${experiences.role}) = lower(${patch.role})`)
      .limit(1);
    if (!existing) {
      summary.push(`Could not update "${patch.role}" at ${patch.company} — no experience with that exact company + role exists (check spelling against the current profile)`);
      continue;
    }
    const { company, role, ...fieldsRaw } = patch;
    const fields: Record<string, unknown> = Object.fromEntries(Object.entries(fieldsRaw).filter(([, v]) => v !== undefined));
    if (fields.techUsed) fields.techUsed = JSON.stringify(fields.techUsed);
    if (Object.keys(fields).length === 0) continue;
    await db.update(experiences).set(fields).where(eq(experiences.id, existing.id));
    summary.push(`Updated experience: ${role} at ${company} (${Object.keys(fields).join(", ")})`);
  }

  for (const patch of delta.updateProjects ?? []) {
    const [existing] = await db
      .select()
      .from(projects)
      .where(sql`lower(${projects.name}) = lower(${patch.name})`)
      .limit(1);
    if (!existing) {
      summary.push(`Could not update "${patch.name}" — no project with that exact name exists (check spelling against the current profile)`);
      continue;
    }
    const { name, tech, ...fieldsRaw } = patch;
    const fields: Record<string, unknown> = Object.fromEntries(Object.entries(fieldsRaw).filter(([, v]) => v !== undefined));
    if (tech !== undefined) fields.tech = JSON.stringify(tech);
    if (Object.keys(fields).length === 0) continue;
    await db.update(projects).set(fields).where(eq(projects.id, existing.id));
    summary.push(`Updated project: ${name} (${Object.keys(fields).join(", ")})`);
  }

  for (const edu of delta.addEducation ?? []) {
    await db.insert(education).values(edu);
    summary.push(`Added education: ${edu.institution}`);
  }

  for (const cert of delta.addCertifications ?? []) {
    await db.insert(certifications).values(cert);
    summary.push(`Added certification: ${cert.name}`);
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
