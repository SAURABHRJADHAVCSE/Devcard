import { useEffect, useState } from "react";
import { getSyncStatus } from "@/lib/api";
import type { SyncStatusEntry } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const KNOWN_PLATFORMS = ["naukri", "indeed", "wellfound"];

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function StatusBadge({ row }: { row: SyncStatusEntry }) {
  if (!row.lastSynced) return <Badge variant="outline">⚪ Never</Badge>;
  if (row.isStale) return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400">🟡 Stale</Badge>;
  return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">✅ Synced</Badge>;
}

export function SyncPage() {
  const [rows, setRows] = useState<SyncStatusEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSyncStatus()
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load sync status"));
  }, []);

  if (error) return <div className="text-destructive">{error}</div>;
  if (!rows) return <div className="text-muted-foreground">Loading…</div>;

  const known = KNOWN_PLATFORMS.map(
    (platform) => rows.find((r) => r.platform === platform) ?? { platform, lastSynced: "", isStale: true },
  );

  return (
    <Card className="max-w-2xl">
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6">Platform</TableHead>
              <TableHead>Last synced</TableHead>
              <TableHead className="px-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {known.map((row) => (
              <TableRow key={row.platform}>
                <TableCell className="px-6 py-3 capitalize">{row.platform}</TableCell>
                <TableCell className="text-muted-foreground">{row.lastSynced ? timeAgo(row.lastSynced) : "Never"}</TableCell>
                <TableCell className="px-6">
                  <StatusBadge row={row} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
