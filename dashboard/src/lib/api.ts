import type { FullProfile, SyncStatusEntry } from "./types";

// Served same-origin by the MCP server (see mcp-server/src/api/router.ts),
// so this is plain fetch — no messaging layer or CORS needed, unlike the
// Chrome extension which has to proxy through its background worker.
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) throw new Error(`${path} returned ${res.status}`);
  return res.json();
}

export const getProfile = () => request<FullProfile>("/api/profile");

export const getResumeMarkdown = () => fetch("/api/resume").then((r) => r.text());

export const chatUpdate = (message: string) =>
  request<{ summary: string[] }>("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

export const getSyncStatus = () => request<SyncStatusEntry[]>("/api/sync-status");

// Each returns the fresh full profile so the caller can update its view
// straight from the response instead of issuing a second GET.
export const deleteSkill = (id: string) => request<FullProfile>(`/api/profile/skills/${id}`, { method: "DELETE" });
export const deleteExperience = (id: string) => request<FullProfile>(`/api/profile/experiences/${id}`, { method: "DELETE" });
export const deleteProject = (id: string) => request<FullProfile>(`/api/profile/projects/${id}`, { method: "DELETE" });
export const deleteEducation = (id: string) => request<FullProfile>(`/api/profile/education/${id}`, { method: "DELETE" });

export interface PdfTemplateInfo {
  id: string;
  name: string;
  description: string;
  atsFriendly: boolean;
}

export const getPdfTemplates = () => request<PdfTemplateInfo[]>("/api/pdf/templates");
