// Mirrors mcp-server/src/db/schema.ts, same as extension/lib/types.ts — the
// MCP server is the source of truth for these shapes.

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

export type SkillCategory = "language" | "framework" | "tool" | "cloud" | "ai" | "soft";
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
  techUsed: string | null;
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
  tech: string | null;
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

export interface ResumeVersion {
  id: string;
  name: string;
  jobDescription: string | null;
  template: string | null;
  summary: string | null;
  skillNames: string | null; // JSON string[]
  projectNames: string | null; // JSON string[]
  createdAt: string | null;
  updatedAt: string | null;
}

export interface TailorResult {
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  suggestedProjects: string[];
  estimatedMatchScore: number;
  scoreRationale: string[];
  atsWarnings: string[];
}

export interface JobPlatform {
  id: string;
  name: string;
  baseUrl: string;
  addedAt: string | null;
}

export type ApplicationStatus = "applied" | "interviewing" | "rejected" | "offer";

export interface Application {
  id: string;
  company: string;
  role: string;
  platform: string | null;
  jobUrl: string | null;
  resumeVersionId: string | null;
  status: ApplicationStatus;
  notes: string | null;
  appliedAt: string | null;
  updatedAt: string | null;
}
