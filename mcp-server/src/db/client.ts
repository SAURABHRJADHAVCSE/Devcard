import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

const sqlite = new Database(process.env.DB_PATH ?? "./resync.db");
// WAL mode so the HTTP API and MCP stdio server (same process, but SQLite
// hates concurrent writers otherwise) don't block each other on writes.
sqlite.exec("PRAGMA journal_mode = WAL;");

// No `schema`/`relations` config: we only use the plain select/insert/update
// query builder (db.select().from(table)...), not drizzle v1's relational
// query API, which would require a defineRelations() setup we don't need here.
export const db = drizzle({ client: sqlite });
