import { spawn } from "bun";

// Windows has no bare "npm" executable — it's npm.cmd, a shell shim — so a
// direct Bun.spawn(["npm", ...]) fails to launch. bun.exe itself has no such
// problem (it's a real .exe), so only the npm-based command needs the shim.
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

// Runs both long-running dev processes from one `bun run dev`. A plain
// package.json script can't run two foreground processes at once, so this
// spawns each with its own cwd and forwards Ctrl+C to both.
const processes = [
  { name: "mcp-server", cmd: ["bun", "run", "dev"], cwd: new URL("./mcp-server", import.meta.url).pathname },
  // Rebuilds dashboard/dist on every save; mcp-server serves that folder as
  // static files (src/api/router.ts). No dev-server/HMR wiring needed here —
  // refresh the browser tab after a change lands.
  { name: "dashboard", cmd: [npm, "run", "watch"], cwd: new URL("./dashboard", import.meta.url).pathname },
].map(({ name, cmd, cwd }) => {
  console.log(`[${name}] starting: ${cmd.join(" ")}`);
  return spawn(cmd, {
    cwd: cwd.replace(/^\/([A-Za-z]:)/, "$1"), // strip the leading "/" Bun's file URL leaves before a Windows drive letter
    stdio: ["inherit", "inherit", "inherit"],
  });
});

function shutdown() {
  for (const proc of processes) proc.kill();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await Promise.all(processes.map((proc) => proc.exited));
