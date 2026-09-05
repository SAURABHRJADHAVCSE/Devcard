import { desc, eq } from "drizzle-orm";
import { db } from "./client";
import { applications } from "./schema";
import { listJobPlatforms, detectPlatform } from "./job-platforms";

export type Application = typeof applications.$inferSelect;

export interface RecordApplicationInput {
  company: string;
  role: string;
  platform?: string;
  jobUrl?: string;
  resumeVersionId?: string;
  notes?: string;
}

export interface UpdateApplicationInput {
  status?: string;
  notes?: string;
}

export async function listApplications(): Promise<Application[]> {
  return db.select().from(applications).orderBy(desc(applications.appliedAt));
}

// Auto-fills `platform` from jobUrl against registered job platforms when
// not given explicitly — see db/job-platforms.ts:detectPlatform.
export async function recordApplication(input: RecordApplicationInput): Promise<Application> {
  const platform = input.platform ?? detectPlatform(input.jobUrl, await listJobPlatforms());
  const rows = await db
    .insert(applications)
    .values({ ...input, platform })
    .returning();
  return rows[0]!;
}

export async function updateApplication(id: string, patch: UpdateApplicationInput): Promise<Application | undefined> {
  const [row] = await db.update(applications).set(patch).where(eq(applications.id, id)).returning();
  return row;
}

export async function deleteApplication(id: string): Promise<Application | undefined> {
  const [row] = await db.delete(applications).where(eq(applications.id, id)).returning();
  return row;
}
