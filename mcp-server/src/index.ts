import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./mcp/server";
import { app } from "./api/router";

async function main() {
  // MCP stdio transport is how Claude Desktop / Cursor talk to this process.
  const mcpServer = createMcpServer();
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);

  // The same process also serves the Chrome extension's HTTP API — the
  // extension can't spawn an MCP stdio client, so it needs a normal port.
  // Only one process needs to actually hold this port: an MCP client (e.g.
  // Claude Desktop) may spawn its own instance of this same script even
  // while `bun run dev` already owns :6366 for the extension. That second
  // instance's stdio connection is still valid — don't crash it just
  // because the HTTP side lost the race for the port.
  const port = Number(process.env.PORT ?? 6366);
  try {
    Bun.serve({ port, fetch: app.fetch });
    console.error(`Devcard MCP server running (stdio) + HTTP API on :${port}`);
  } catch (err) {
    console.error(`Devcard MCP server running (stdio only) — :${port} already in use by another instance:`, err);
  }
}

main().catch((err) => {
  console.error("Fatal error starting Devcard MCP server:", err);
  process.exit(1);
});
