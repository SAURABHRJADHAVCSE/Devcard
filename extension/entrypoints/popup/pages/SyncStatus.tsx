import { useEffect, useState } from "react";
import { getSyncStatus } from "@/lib/api";
import type { SyncStatusEntry } from "@/lib/types";

const PROFILE_URLS: Record<string, string> = {
  naukri: "https://www.naukri.com/mnjuser/profile",
  indeed: "https://myjobs.indeed.com/resume",
  wellfound: "https://wellfound.com/profile/edit",
};

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function SyncStatus() {
  const [rows, setRows] = useState<SyncStatusEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSyncStatus()
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load sync status"));
  }, []);

  if (error) return <div className="p-4 text-sm text-red-600">{error}</div>;
  if (!rows) return <div className="p-4 text-sm text-gray-400">Loading…</div>;

  const known = Object.keys(PROFILE_URLS).map(
    (platform) => rows.find((r) => r.platform === platform) ?? { platform, lastSynced: "", isStale: true },
  );

  return (
    <div className="p-4 text-sm">
      <table className="w-full text-left">
        <thead>
          <tr className="text-xs text-gray-400">
            <th className="pb-2 font-medium">Platform</th>
            <th className="pb-2 font-medium">Last synced</th>
            <th className="pb-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {known.map((row) => (
            <tr
              key={row.platform}
              className="cursor-pointer border-t border-gray-100 hover:bg-gray-50"
              onClick={() => chrome.tabs.create({ url: PROFILE_URLS[row.platform] })}
            >
              <td className="py-2 capitalize">{row.platform}</td>
              <td className="py-2 text-gray-500">{row.lastSynced ? timeAgo(row.lastSynced) : "Never"}</td>
              <td className="py-2">
                {!row.lastSynced ? "⚪ Never" : row.isStale ? "🟡 Stale" : "✅ Synced"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
