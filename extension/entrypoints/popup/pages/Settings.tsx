import { useEffect, useState } from "react";

const DEFAULT_SERVER_URL = "http://localhost:6366";

export function Settings() {
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    chrome.storage.local.get("mcpServerUrl").then((stored) => {
      if (stored.mcpServerUrl) setServerUrl(stored.mcpServerUrl as string);
    });
  }, []);

  async function handleSave() {
    await chrome.storage.local.set({ mcpServerUrl: serverUrl });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="p-4 text-sm">
      <label className="mb-1 block font-medium text-gray-700">MCP server URL</label>
      <input
        className="w-full rounded-md border border-gray-300 p-2 focus:border-brand focus:outline-none"
        value={serverUrl}
        onChange={(e) => setServerUrl(e.target.value)}
        placeholder={DEFAULT_SERVER_URL}
      />
      <div className="mt-1 text-xs text-gray-400">
        Only change this if you're running the MCP server on a different host or port.
      </div>
      <button className="mt-3 rounded-md bg-brand px-3 py-1.5 text-white" onClick={handleSave}>
        {saved ? "Saved ✓" : "Save"}
      </button>
    </div>
  );
}
