import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { fileURLToPath } from "url";
import { dirname, join, isAbsolute } from "path";

// A relative DB_PATH (including the "./resync.db" default) must not resolve
// against process.cwd() — an MCP client (Claude Desktop/Code, or Claude
// acting through a browser-control session) spawns this process from a cwd
// it controls, not necessarily mcp-server/. That mismatch doesn't error; it
// silently opens/creates a fresh, empty database at the wrong location,
// which looks like "my profile is empty" with no indication why. Anchoring
// to this module's own directory keeps DB_PATH's default correct regardless
// of caller cwd, the same fix already applied to the dashboard dist path in
// api/router.ts.
function resolveDbPath(raw: string): string {
  if (isAbsolute(raw)) return raw;
  const mcpServerRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  return join(mcpServerRoot, raw);
}

const sqlite = new Database(resolveDbPath(process.env.DB_PATH ?? "./resync.db"));
// WAL mode so the HTTP API and MCP stdio server (same process, but SQLite
// hates concurrent writers otherwise) don't block each other on writes.
sqlite.exec("PRAGMA journal_mode = WAL;");

// No `schema`/`relations` config: we only use the plain select/insert/update
// query builder (db.select().from(table)...), not drizzle v1's relational
// query API, which would require a defineRelations() setup we don't need here.
export const db = drizzle({ client: sqlite });
