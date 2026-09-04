import type { Message, MessageResponse, FormField } from "./messages";
import type { FullProfile, SyncStatusEntry } from "./types";

async function send<T>(msg: Message): Promise<T> {
  const response = (await chrome.runtime.sendMessage(msg)) as MessageResponse<T>;
  if (!response.ok) throw new Error(response.error);
  return response.data;
}

export const getProfile = () => send<FullProfile>({ type: "GET_PROFILE" });

export const patchProfile = (updates: Record<string, unknown>) =>
  send<FullProfile["profile"]>({ type: "PATCH_PROFILE", updates });

export const chatUpdate = (message: string) => send<{ summary: string[] }>({ type: "CHAT_UPDATE", message });

export const getSyncStatus = () => send<SyncStatusEntry[]>({ type: "GET_SYNC_STATUS" });

export const markSynced = (platform: string) => send<SyncStatusEntry>({ type: "MARK_SYNCED", platform });

export const getPdf = () => send<ArrayBuffer>({ type: "GET_PDF" });

export const mapFields = (fields: FormField[]) =>
  send<{ mappings: { id: string; value: string }[] }>({ type: "MAP_FIELDS", fields }).then((r) => r.mappings);
