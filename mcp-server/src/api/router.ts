import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { profileRouter } from "./profile";
import { chatRouter } from "./chat";
import { resumeRouter } from "./resume";
import { pdfRouter } from "./pdf";
import { syncStatusRouter } from "./sync-status";
import { mapFieldsRouter } from "./map-fields";

export const app = new Hono();

// Only the extension (and the same-origin dashboard, which needs no CORS
// header at all) may call this API — no open CORS for anyone else.
app.use(
  "*",
  cors({
    origin: (origin) => (origin?.startsWith("chrome-extension://") ? origin : ""),
  }),
);

app.get("/health", (c) => c.json({ ok: true, version: "0.1.0" }));

app.route("/api/profile", profileRouter);
app.route("/api/chat", chatRouter);
app.route("/api/resume", resumeRouter);
app.route("/api/pdf", pdfRouter);
app.route("/api/sync-status", syncStatusRouter);
app.route("/api/map-fields", mapFieldsRouter);

// Resolved from this file's own location, not process.cwd() — an MCP
// client (Claude Desktop/Code) can spawn this process from an unpredictable
// working directory (same trap DB_PATH hit). dashboard/ is a sibling of
// mcp-server/, both under resync/.
const dashboardDist = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "dashboard", "dist");
app.use("/*", serveStatic({ root: dashboardDist }));
