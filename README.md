# Devcard

One knowledge base. Every platform in sync.

**New here or want to know what this can actually do?** → [`GUIDE.md`](./GUIDE.md)

## Parts

- **`mcp-server/`** — the brain. SQLite knowledge base, MCP tools (Claude Desktop / Claude Code), HTTP API on `:6366`, and serves the dashboard.
- **`dashboard/`** — the view. A full-page web UI (served by `mcp-server` itself at `http://localhost:6366`) for browsing your knowledge base at full size — install it as an app via Chrome's install icon in the address bar for a standalone window.

There used to be a Chrome extension here (`extension/`) that auto-filled job application forms.
Removed 2026-09-05 — Claude for Chrome covers the same job (reading this same knowledge base over
MCP and acting on the live page) without a second codebase to maintain.

## Run everything

```bash
bun run dev
```

One command from this directory starts both (mcp-server + dashboard build). Then open
**http://localhost:6366** for the dashboard.

## Connect Claude Desktop / Claude Code

See `mcp-server/README.md` — the short version is `claude mcp add devcard -- bun mcp-server/src/index.ts`, then `/mcp` to verify. Claude Desktop/Code auto-start the server themselves; you don't need `bun run dev` running just for that (though it doesn't hurt — the server gracefully skips its HTTP port if another instance already owns it).
