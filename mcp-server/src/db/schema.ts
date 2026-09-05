import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

// Core profile (one row, id = "me")
export const profile = sqliteTable("profile", {
  id: text("id").primaryKey().$defaultFn(() => "me"),
  name: text("name").notNull(),
  headline: text("headline"), // "Full-stack developer building AI products"
  bio: text("bio"), // longer about section
  email: text("email"),
  phone: text("phone"),
  location: text("location"),
  website: text("website"),
  github: text("github"),
  linkedin: text("linkedin"),
  twitter: text("twitter"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdateFn(() => new Date()),
});

export const skills = sqliteTable("skills", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  category: text("category").notNull(), // "language" | "framework" | "tool" | "cloud" | "soft"
  level: text("level"), // "beginner" | "intermediate" | "advanced" | "expert"
  yearsOfExperience: real("years_of_experience"),
  addedAt: integer("added_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const experiences = sqliteTable("experiences", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  company: text("company").notNull(),
  role: text("role").notNull(),
  description: text("description"),
  location: text("location"),
  employmentType: text("employment_type"), // "full-time" | "part-time" | "freelance" | "internship"
  techUsed: text("tech_used"), // JSON array stored as text
  startDate: text("start_date").notNull(), // "2024-01"
  endDate: text("end_date"), // null = current
  isCurrent: integer("is_current", { mode: "boolean" }).default(false),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description"),
  longDescription: text("long_description"),
  url: text("url"),
  github: text("github"),
  tech: text("tech"), // JSON array
  status: text("status"), // "active" | "archived" | "wip"
  featured: integer("featured", { mode: "boolean" }).default(false),
  startDate: text("start_date"),
  endDate: text("end_date"),
});

export const education = sqliteTable("education", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  institution: text("institution").notNull(),
  degree: text("degree"), // "B.E." | "M.Tech" | "B.Sc." etc.
  field: text("field"), // "Computer Science"
  startYear: integer("start_year"),
  endYear: integer("end_year"),
  gpa: real("gpa"),
  activities: text("activities"),
});

export const certifications = sqliteTable("certifications", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  issuer: text("issuer"),
  issuedDate: text("issued_date"),
  expiresDate: text("expires_date"),
  credentialUrl: text("credential_url"),
});

// A saved, named resume tailored to one job description — never a copy of
// the base data, just an overlay on top of it (rendered by merging these
// fields onto getFullProfile()'s result, see pdf/tailor.ts). skillNames can
// include names that don't exist in the `skills` table at all — a JD-required
// skill the user approved adding to THIS resume only, never written back to
// the real knowledge base. Editing the base profile later still flows
// through automatically for anything a version didn't override (unset
// summary/skillNames/projectNames means "use whatever the base profile
// currently says").
export const resumeVersions = sqliteTable("resume_versions", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(), // "Google — Senior SWE, Jan 2026"
  jobDescription: text("job_description"), // pasted JD text, kept for re-tailoring later
  template: text("template").default("polished"),
  summary: text("summary"), // tailored professional-summary override; null = use profile.bio
  skillNames: text("skill_names"), // JSON string[] — full skill list to show, in relevance order; null = use base skills as-is
  projectNames: text("project_names"), // JSON string[] — which projects to feature, in order; null = use all base projects
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdateFn(() => new Date()),
});

// Job sites the user actually uses (e.g. LinkedIn, Naukri) — lets Claude
// know which platforms to search without being told every time, and lets
// recordApplication auto-label an application's platform from its jobUrl
// (see db/job-platforms.ts:detectPlatform) instead of the caller having to
// name it. baseUrl is stored as a bare hostname ("linkedin.com"), not a
// full URL — normalizeHost() handles stripping scheme/path on the way in
// so a pasted full URL still lands here clean.
export const jobPlatforms = sqliteTable("job_platforms", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(), // "LinkedIn", "Naukri"
  baseUrl: text("base_url").notNull(),
  addedAt: integer("added_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// One row per job application actually submitted — separate from
// resumeVersions (a resumeVersion is prepared, possibly for a role you never
// apply to; an application is a record that you did). resumeVersionId is a
// loose reference (no FK constraint) to whichever tailored version was used,
// if any — deliberately not enforced so deleting an old resume version never
// blocks or cascades into losing an application record.
export const applications = sqliteTable("applications", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  company: text("company").notNull(),
  role: text("role").notNull(),
  platform: text("platform"), // resolved label, e.g. "LinkedIn" — null if not detected/given
  jobUrl: text("job_url"),
  resumeVersionId: text("resume_version_id"),
  status: text("status").notNull().default("applied"), // "applied" | "interviewing" | "rejected" | "offer"
  notes: text("notes"),
  appliedAt: integer("applied_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdateFn(() => new Date()),
});

// Every update to the knowledge base is logged here first, then applied —
// this is the audit trail that lets us see what an AI parse actually changed.
export const knowledgeEvents = sqliteTable("knowledge_events", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  source: text("source").notNull(), // "chat" | "mcp" | "direct" | "import"
  rawMessage: text("raw_message"), // what the user said (if chat)
  parsedDelta: text("parsed_delta"), // JSON of what actually changed
  appliedAt: integer("applied_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
