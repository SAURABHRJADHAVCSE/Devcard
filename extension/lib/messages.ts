// All message types the background service worker handles. Content scripts
// and popup pages never call fetch(localhost) directly (Rule 2) — every
// request goes through chrome.runtime.sendMessage to here.
export type Message =
  | { type: "GET_PROFILE" }
  | { type: "CHAT_UPDATE"; message: string }
  | { type: "GET_PDF" }
  | { type: "MARK_SYNCED"; platform: string }
  | { type: "GET_SYNC_STATUS" }
  | { type: "PATCH_PROFILE"; updates: Record<string, unknown> }
  | { type: "MAP_FIELDS"; fields: FormField[] };

export interface FormField {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
}

export type MessageResponse<T = unknown> = { ok: true; data: T } | { ok: false; error: string };
