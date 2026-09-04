import { setNativeInputValue } from "./base";
import { mapFields } from "@/lib/api";
import type { FormField } from "@/lib/messages";

type FillableElement = HTMLInputElement | HTMLTextAreaElement;

const SKIP_TYPES = new Set(["hidden", "submit", "button", "reset", "file", "image", "checkbox", "radio", "password"]);

function isVisible(el: HTMLElement): boolean {
  return el.offsetParent !== null || el.getClientRects().length > 0;
}

function labelFor(el: HTMLElement): string {
  const id = el.id;
  if (id) {
    const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
    if (label?.textContent?.trim()) return label.textContent.trim();
  }
  const wrapping = el.closest("label");
  if (wrapping?.textContent?.trim()) return wrapping.textContent.trim();
  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel?.trim()) return ariaLabel.trim();
  return (el as HTMLInputElement).placeholder?.trim() ?? "";
}

// Every visible, labeled, non-sensitive text field on the page — the raw
// material for the AI field mapper. Password/OTP/file/checkbox/radio are
// excluded outright rather than left to the model to skip (Rule 5's "the
// extension never touches the API key" spirit extended to credentials
// generally: don't even offer them to an LLM).
function collectFields(): { info: FormField; el: FillableElement }[] {
  const candidates = document.querySelectorAll<FillableElement>("input, textarea");
  const result: { info: FormField; el: FillableElement }[] = [];
  let counter = 0;

  for (const el of candidates) {
    if (el instanceof HTMLInputElement && SKIP_TYPES.has(el.type)) continue;
    if (!isVisible(el)) continue;
    const label = labelFor(el);
    if (!label) continue;

    result.push({
      info: {
        id: `f${counter++}`,
        label,
        type: el instanceof HTMLInputElement ? el.type : "textarea",
        placeholder: (el as HTMLInputElement).placeholder || undefined,
      },
      el,
    });
  }

  return result;
}

export interface FillResult {
  filled: number;
  total: number;
}

export async function fillWithDevcard(): Promise<FillResult> {
  const fields = collectFields();
  if (fields.length === 0) return { filled: 0, total: 0 };

  const mappings = await mapFields(fields.map((f) => f.info));

  let filled = 0;
  for (const mapping of mappings) {
    const match = fields.find((f) => f.info.id === mapping.id);
    if (match && mapping.value) {
      setNativeInputValue(match.el, mapping.value);
      filled++;
    }
  }

  return { filled, total: fields.length };
}

// Cheap pre-check so the generic button only appears where there's actually
// something to fill, instead of on every page the content script matches.
export function hasFillableFields(): boolean {
  return collectFields().length > 0;
}
