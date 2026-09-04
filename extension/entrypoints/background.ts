import type { Message, MessageResponse } from "@/lib/messages";

const DEFAULT_SERVER_URL = "http://localhost:6366";

async function getServerUrl(): Promise<string> {
  const stored = await chrome.storage.local.get("mcpServerUrl");
  return (stored.mcpServerUrl as string | undefined) ?? DEFAULT_SERVER_URL;
}

// The only place in the extension that talks to the MCP server's HTTP API.
// Content scripts can't fetch localhost directly under MV3 (Rule 2), so
// every request is proxied through this single handler.
async function handleMessage(msg: Message): Promise<MessageResponse> {
  const base = await getServerUrl();

  try {
    switch (msg.type) {
      case "GET_PROFILE": {
        const res = await fetch(`${base}/api/profile`);
        if (!res.ok) return { ok: false, error: `Server returned ${res.status}` };
        return { ok: true, data: await res.json() };
      }
      case "PATCH_PROFILE": {
        const res = await fetch(`${base}/api/profile`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(msg.updates),
        });
        if (!res.ok) return { ok: false, error: `Server returned ${res.status}` };
        return { ok: true, data: await res.json() };
      }
      case "CHAT_UPDATE": {
        const res = await fetch(`${base}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg.message }),
        });
        if (!res.ok) return { ok: false, error: `Server returned ${res.status}` };
        return { ok: true, data: await res.json() };
      }
      case "GET_PDF": {
        const res = await fetch(`${base}/api/pdf`);
        if (!res.ok) return { ok: false, error: `Server returned ${res.status}` };
        return { ok: true, data: await res.arrayBuffer() };
      }
      case "GET_SYNC_STATUS": {
        const res = await fetch(`${base}/api/sync-status`);
        if (!res.ok) return { ok: false, error: `Server returned ${res.status}` };
        return { ok: true, data: await res.json() };
      }
      case "MARK_SYNCED": {
        const res = await fetch(`${base}/api/sync-status/${encodeURIComponent(msg.platform)}`, {
          method: "POST",
        });
        if (!res.ok) return { ok: false, error: `Server returned ${res.status}` };
        return { ok: true, data: await res.json() };
      }
      case "MAP_FIELDS": {
        const res = await fetch(`${base}/api/map-fields`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: msg.fields }),
        });
        if (!res.ok) return { ok: false, error: `Server returned ${res.status}` };
        return { ok: true, data: await res.json() };
      }
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not reach MCP server" };
  }
}

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((msg: Message, _sender, sendResponse) => {
    handleMessage(msg).then(sendResponse);
    return true; // keep the channel open for the async response
  });
});
