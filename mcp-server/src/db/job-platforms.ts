import { eq } from "drizzle-orm";
import { db } from "./client";
import { jobPlatforms } from "./schema";

export type JobPlatform = typeof jobPlatforms.$inferSelect;

export async function listJobPlatforms(): Promise<JobPlatform[]> {
  return db.select().from(jobPlatforms);
}

export async function addJobPlatform(name: string, baseUrl: string): Promise<JobPlatform> {
  const rows = await db.insert(jobPlatforms).values({ name, baseUrl: normalizeHost(baseUrl) }).returning();
  return rows[0]!;
}

export async function deleteJobPlatform(id: string): Promise<JobPlatform | undefined> {
  const [row] = await db.delete(jobPlatforms).where(eq(jobPlatforms.id, id)).returning();
  return row;
}

// Strips scheme/path/query and a leading "www." so a pasted full URL
// ("https://www.linkedin.com/jobs/view/123") and a bare domain
// ("linkedin.com") both normalize to the same stored value.
export function normalizeHost(url: string): string {
  try {
    const withScheme = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return new URL(withScheme).hostname.replace(/^www\./, "");
  } catch {
    return url
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./, "")
      .split("/")[0]!;
  }
}

// Matches a job posting URL's hostname against registered platforms (a
// subdomain like "in.naukri.com" still matches a saved "naukri.com") so
// recordApplication can fill `platform` without the caller naming it.
export function detectPlatform(jobUrl: string | undefined, platforms: JobPlatform[]): string | undefined {
  if (!jobUrl) return undefined;
  const host = normalizeHost(jobUrl);
  return platforms.find((p) => host === p.baseUrl || host.endsWith(`.${p.baseUrl}`))?.name;
}
