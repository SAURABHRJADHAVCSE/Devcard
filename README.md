# Devcard

**One knowledge base about you — reachable from Claude, and browsable in a real dashboard.**

Instead of manually keeping your resume, LinkedIn, and job applications in sync, tell Devcard
what you learned or built once, in plain English, from inside any Claude conversation. It's
stored in your own local database and can be pulled back out however you need it: as structured
JSON, clean Markdown, a polished one-page PDF resume tailored to a specific job description, or
browsed in a full dashboard.

Everything runs locally on your own machine, using your own database and your own AI API key —
no account, no hosted service, no data leaving your computer except the AI calls you configure.

**New here or want to know what this can actually do?** → [`GUIDE.md`](./GUIDE.md)

## Quick start

```bash
git clone https://github.com/SAURABHRJADHAVCSE/Devcard.git
cd Devcard/mcp-server
bun install
cp .env.example .env   # then fill in an API key — see mcp-server/README.md
bun run db:migrate
cd .. && bun run dev
```

Then open **http://localhost:6366** for the dashboard, or connect Claude (see below) and just
start talking to it.

> **Windows note**: `bun install` can fail with an `EPERM ... moving "drizzle-kit" to cache dir`
> error — a transient Windows/antivirus file lock, not a real problem with the project. Re-run
> `bun install` a couple of times, and if it still fails specifically on `drizzle-kit`, run
> `npm install --no-save -D drizzle-kit@1.0.0-rc.4` instead (see `mcp-server/README.md` for
> details). This is common enough on a fresh Windows clone that it's worth expecting.

## Parts

- **`mcp-server/`** — the brain. SQLite knowledge base, MCP tools (Claude Desktop / Claude Code), HTTP API on `:6366`, and serves the dashboard.
- **`dashboard/`** — the view. A full-page web UI (served by `mcp-server` itself at `http://localhost:6366`) for browsing your knowledge base at full size — install it as an app via Chrome's install icon in the address bar for a standalone window.

There used to be a Chrome extension here (`extension/`) that auto-filled job application forms.
Removed 2026-09-05 — Claude for Chrome covers the same job (reading this same knowledge base over
MCP and acting on the live page) without a second codebase to maintain.

## Connect Claude Desktop / Claude Code

See `mcp-server/README.md` — the short version is `claude mcp add devcard -- bun mcp-server/src/index.ts`, then `/mcp` to verify. Claude Desktop/Code auto-start the server themselves; you don't need `bun run dev` running just for that (though it doesn't hurt — the server gracefully skips its HTTP port if another instance already owns it).

## License

[MIT](./LICENSE) — do what you want with it.
