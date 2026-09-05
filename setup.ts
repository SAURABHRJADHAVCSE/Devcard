import { spawn } from "bun";
import { existsSync, copyFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// One-command setup: installs both subprojects' dependencies, creates a
// starter .env if one doesn't exist yet, and creates the (empty) database
// schema — everything a fresh clone needs before `bun run dev` or
// connecting Claude Desktop/Code works. Steps run sequentially (not
// parallel like dev.ts) because each depends on the previous one finishing
// (can't migrate before install, etc).
const root = dirname(fileURLToPath(import.meta.url));
const mcpServerDir = join(root, "mcp-server");
const dashboardDir = join(root, "dashboard");

// Windows has no bare "npm" executable — it's npm.cmd, a shell shim (same
// reasoning as dev.ts).
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

async function run(label: string, cmd: string[], cwd: string): Promise<number> {
  console.log(`\n> [${label}] ${cmd.join(" ")}`);
  const proc = spawn(cmd, { cwd, stdio: ["inherit", "inherit", "inherit"] });
  return proc.exited;
}

async function runOrExit(label: string, cmd: string[], cwd: string) {
  const code = await run(label, cmd, cwd);
  if (code !== 0) {
    console.error(`\n[${label}] failed (exit ${code}).`);
    process.exit(code);
  }
}

// `bun install` on Windows can hit a transient antivirus file-lock (EPERM
// moving a package to bun's cache dir) — usually clears on retry, but
// drizzle-kit specifically has been seen failing deterministically across
// many retries on some machines. Self-heal both cases rather than making
// every fresh clone hit this and have to read an error message: retry a
// few times, then fall back to installing drizzle-kit directly via npm
// (same workaround documented in mcp-server/README.md) if it's still
// missing afterward. Nothing else in the dependency tree has shown this
// failure, so this fallback is narrowly scoped to drizzle-kit.
async function installMcpServerDeps() {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const code = await run(`mcp-server install (attempt ${attempt}/3)`, ["bun", "install"], mcpServerDir);
    if (code === 0) return;
  }
  if (!existsSync(join(mcpServerDir, "node_modules", "drizzle-kit"))) {
    console.log("\n> bun install couldn't extract drizzle-kit after 3 tries (known Windows/antivirus file-lock issue) — falling back to npm for just that package.");
    await runOrExit("drizzle-kit fallback install", [npm, "install", "--no-save", "-D", "drizzle-kit@1.0.0-rc.4"], mcpServerDir);
  }
  if (!existsSync(join(mcpServerDir, "node_modules", "drizzle-kit"))) {
    console.error("\ndrizzle-kit still missing after the fallback install — can't continue. See mcp-server/README.md's Windows note.");
    process.exit(1);
  }
}

await installMcpServerDeps();
await runOrExit("dashboard install", [npm, "install"], dashboardDir);

const envPath = join(mcpServerDir, ".env");
const envExamplePath = join(mcpServerDir, ".env.example");
if (!existsSync(envPath)) {
  copyFileSync(envExamplePath, envPath);
  console.log("\n> Created mcp-server/.env from .env.example (only needed for the dashboard's chat box — see below).");
} else {
  console.log("\n> mcp-server/.env already exists, leaving it as-is.");
}

await runOrExit("database migrate", ["bun", "run", "db:migrate"], mcpServerDir);

console.log(`
Setup complete. Two ways to actually use Devcard from here:

1. Claude Desktop / Claude Code (no API key needed for this):
   claude mcp add devcard -- bun ${join(mcpServerDir, "src", "index.ts")}
   Then just talk to Claude normally — see GUIDE.md for prompt examples.

2. The dashboard (needs an API key in mcp-server/.env for its chat box only):
   bun run dev
   Then open http://localhost:6366
`);
