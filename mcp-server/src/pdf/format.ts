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

// Profile/project URLs are stored as the user typed them ("github.com/x",
// "x.dev") — fine as display text, but a real PDF hyperlink needs a scheme
// or most viewers won't treat it as clickable/will resolve it relative to
// nothing. Only prepends when one isn't already there.
export function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

// The DB stores one free-text `description` per experience/project (not a
// bullets array) — splitting on newlines gets bullet-style output for
// anyone who writes one achievement per line, without a schema migration.
// A single-paragraph description just becomes one bullet.
//
// The leading-marker strip only eats a single "-"/"•"/"*" followed by
// whitespace (a real list marker) — a bare "*" not followed by another "*"
// is excluded via the negative lookahead so a line opening with a
// **bold** span (see parseInlineBold) keeps its marker pair intact instead
// of having the first "*" silently stripped.
export function toBullets(description: string | null): string[] {
  if (!description) return [];
  return description
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[•-]|\*(?!\*))\s*/, "").trim())
    .filter(Boolean);
}

export interface InlineSegment {
  text: string;
  bold: boolean;
}

// Splits on markdown-style **bold** markers so a template can render mixed
// emphasis within one line (e.g. "Improved LCP by **~45%**"). Text with no
// markers comes back as a single plain segment; an unmatched/stray "**"
// (no closing pair) is left as literal text rather than dropped or crashing.
export function parseInlineBold(text: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) segments.push({ text: text.slice(last, match.index), bold: false });
    segments.push({ text: match[1] ?? "", bold: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last), bold: false });
  return segments.length > 0 ? segments : [{ text, bold: false }];
}
