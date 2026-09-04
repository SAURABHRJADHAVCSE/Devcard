# Devcard

One knowledge base. Every platform in sync.

**New here or want to know what this can actually do?** → [`GUIDE.md`](./GUIDE.md)

## Parts

- **`mcp-server/`** — the brain. SQLite knowledge base, MCP tools (Claude Desktop / Claude Code), HTTP API on `:6366`, and serves the dashboard.
- **`extension/`** — the hands. Chrome extension that syncs your profile into LinkedIn/Naukri/Indeed/Wellfound and any other site's forms.
- **`dashboard/`** — the view. A full-page web UI (served by `mcp-server` itself at `http://localhost:6366`) for browsing your knowledge base at full size — install it as an app via Chrome's install icon in the address bar for a standalone window.

## Run everything

```bash
bun run dev
```

One command from this directory starts all three (mcp-server + extension build + dashboard build). Then:

- Open **http://localhost:6366** for the dashboard.
- Load `extension/.output/chrome-mv3-dev` as an unpacked extension in `chrome://extensions` (once; it hot-reloads after that).

## Connect Claude Desktop / Claude Code

See `mcp-server/README.md` — the short version is `claude mcp add devcard -- bun mcp-server/src/index.ts`, then `/mcp` to verify. Claude Desktop/Code auto-start the server themselves; you don't need `bun run dev` running just for that (though it doesn't hurt — the server gracefully skips its HTTP port if another instance already owns it).
