export function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const SKILL_CATEGORY_LABELS: Record<string, string> = {
  language: "Languages",
  framework: "Frameworks",
  tool: "Tools",
  cloud: "Cloud",
  soft: "Soft Skills",
};

export function dateRange(start: string | null, end: string | null, isCurrent?: boolean | null): string {
  const from = start ?? "";
  const to = isCurrent ? "Present" : (end ?? "");
  return [from, to].filter(Boolean).join(" – ");
}
