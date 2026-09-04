import { desc, eq } from "drizzle-orm";
import { db } from "./client";
import { resumeVersions } from "./schema";

export type ResumeVersion = typeof resumeVersions.$inferSelect;

export interface SaveResumeVersionInput {
  name: string;
  jobDescription?: string;
  template?: string;
  summary?: string;
  skillNames?: string[];
  projectNames?: string[];
}

// Shared between the MCP tools (tools/resume-versions.ts) and the HTTP API
// (api/resume-versions.ts) so both surfaces store/read versions identically
// — same reasoning as db/get-full-profile.ts being shared rather than each
// caller re-implementing the join.
export async function listResumeVersions(): Promise<ResumeVersion[]> {
  return db.select().from(resumeVersions).orderBy(desc(resumeVersions.updatedAt));
}

export async function getResumeVersion(id: string): Promise<ResumeVersion | undefined> {
  const [row] = await db.select().from(resumeVersions).where(eq(resumeVersions.id, id)).limit(1);
  return row;
}

export async function saveResumeVersion(input: SaveResumeVersionInput): Promise<ResumeVersion> {
  const rows = await db
    .insert(resumeVersions)
    .values({
      name: input.name,
      jobDescription: input.jobDescription,
      template: input.template,
      summary: input.summary,
      skillNames: input.skillNames ? JSON.stringify(input.skillNames) : null,
      projectNames: input.projectNames ? JSON.stringify(input.projectNames) : null,
    })
    .returning();
  return rows[0]!;
}

export async function deleteResumeVersion(id: string): Promise<ResumeVersion | undefined> {
  const [row] = await db.delete(resumeVersions).where(eq(resumeVersions.id, id)).returning();
  return row;
}
