// Mirrors mcp-server/src/db/schema.ts. The MCP server is the source of
// truth for these shapes — the extension never derives or stores its own.

export interface Profile {
  id: string;
  name: string;
  headline: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  github: string | null;
  linkedin: string | null;
  twitter: string | null;
  updatedAt: string | null;
}

export type SkillCategory = "language" | "framework" | "tool" | "cloud" | "soft";
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel | null;
  yearsOfExperience: number | null;
  addedAt: string | null;
}

export type EmploymentType = "full-time" | "part-time" | "freelance" | "internship";

export interface Experience {
  id: string;
  company: string;
  role: string;
  description: string | null;
  location: string | null;
  employmentType: EmploymentType | null;
  techUsed: string | null; // JSON-encoded string[]
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

export type ProjectStatus = "active" | "archived" | "wip";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  longDescription: string | null;
  url: string | null;
  github: string | null;
  tech: string | null; // JSON-encoded string[]
  status: ProjectStatus | null;
  featured: boolean;
  startDate: string | null;
  endDate: string | null;
}

export interface Education {
  id: string;
  institution: string;
  degree: string | null;
  field: string | null;
  startYear: number | null;
  endYear: number | null;
  gpa: number | null;
  activities: string | null;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string | null;
  issuedDate: string | null;
  expiresDate: string | null;
  credentialUrl: string | null;
}

export interface FullProfile {
  profile: Profile | undefined;
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
}

export interface SyncStatusEntry {
  platform: string;
  lastSynced: string;
  isStale: boolean;
}
