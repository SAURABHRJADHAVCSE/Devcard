import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { profileRouter } from "./profile";
import { chatRouter } from "./chat";
import { resumeRouter } from "./resume";
import { pdfRouter } from "./pdf";
import { resumeVersionsRouter } from "./resume-versions";
import { jobPlatformsRouter } from "./job-platforms";
import { applicationsRouter } from "./applications";

export const app = new Hono();

// No CORS middleware: every caller is either same-origin (the dashboard,
// served from this same app below) or a plain top-level navigation/curl (the
// PDF download link in get_resume_pdf's response) — neither needs a
// cross-origin fetch grant. The old Chrome extension needed both a
// Private-Network-Access header and a chrome-extension://-scoped cors()
// policy; both were removed with it (2026-09-05).

app.get("/health", (c) => c.json({ ok: true, version: "0.1.0" }));

app.route("/api/profile", profileRouter);
app.route("/api/chat", chatRouter);
app.route("/api/resume", resumeRouter);
app.route("/api/pdf", pdfRouter);
app.route("/api/resume-versions", resumeVersionsRouter);
app.route("/api/job-platforms", jobPlatformsRouter);
app.route("/api/applications", applicationsRouter);

// Resolved from this file's own location, not process.cwd() — an MCP
// client (Claude Desktop/Code) can spawn this process from an unpredictable
// working directory (same trap DB_PATH hit). dashboard/ is a sibling of
// mcp-server/, both under resync/.
const dashboardDist = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "dashboard", "dist");
app.use("/*", serveStatic({ root: dashboardDist }));
