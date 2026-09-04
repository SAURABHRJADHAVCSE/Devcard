# devcard mcp-server

The brain of Devcard: stores the profile knowledge base in SQLite, exposes MCP tools
over stdio (for Claude Desktop / Cursor), and an HTTP API on `:6366` (serves the dashboard and
the PDF download link from `get_resume_pdf`).

## Setup

```bash
bun install
cp .env.example .env   # then fill in ANTHROPIC_API_KEY
bun run db:generate    # only needed after editing src/db/schema.ts
bun run db:migrate
bun run dev
```

## Connect Claude Code

```bash
claude mcp add devcard --env AI_PROVIDER=glm --env GLM_API_KEY=<your-key> --env GLM_MODEL=glm-4.5-flash -- bun /absolute/path/to/mcp-server/src/index.ts
```

Verify with `/mcp` inside a Claude Code session — it shows connection status and lets you browse the
server's tools without touching a config file.

Use `--env` for every var the server needs (not a bare `.env` reference): Claude Code spawns the
process with an unpredictable working directory (there's no `cwd` field in the server config), and
Bun's `.env` auto-loading is resolved relative to that cwd, not the script's own directory — so a
bare `bun .../index.ts` entry can silently start with no API key.

Add `--scope project` to commit the server into a checked-in `.mcp.json` so teammates get it
automatically (each person still approves it on first run).

## Connect Claude Desktop

Add to `claude_desktop_config.json`, again passing `env` explicitly for the same reason:

```json
{
  "mcpServers": {
    "devcard": {
      "command": "bun",
      "args": ["/absolute/path/to/mcp-server/src/index.ts"],
      "env": { "AI_PROVIDER": "glm", "GLM_API_KEY": "your-key", "GLM_MODEL": "glm-4.5-flash" }
    }
  }
}
```

## Known environment issue

`bun add`/`bun install` can fail on this machine with `EPERM ... moving "drizzle-kit" to cache dir`
(a transient Windows file-lock, likely AV scanning the extracted tarball). Workaround used here:
`npm install --no-save -D drizzle-kit@1.0.0-rc.4` populates `node_modules` directly, then
`package.json` was hand-edited to record the dependency. If this recurs for other packages, the
same workaround applies.
