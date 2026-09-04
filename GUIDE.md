# Devcard — User Guide

One knowledge base about you. Update it once, in plain English, from wherever you happen to
be — and pull it back out however you need it: through Claude, in a full dashboard, or
autofilled straight into a job site's form.

This doc is "what can I actually do with this." For install/setup steps, see the root
`README.md` and `mcp-server/README.md`.

---

## The three ways in

| Surface | What it's for | Where |
|---|---|---|
| **Claude Desktop / Claude Code** | Talk to your knowledge base in natural language, no UI needed | Any Claude conversation, once connected |
| **Dashboard** | Browse everything at full size, export as Markdown | `http://localhost:6366` |
| **Chrome extension** | Sync your profile *into* other sites' forms | Toolbar icon + buttons injected on job sites |

All three read and write the **same** SQLite database through the same MCP server — update
your skills from Claude on your phone via Cowork, and the dashboard on your laptop shows it
immediately.

---

## Keep it always in sync — the standing instruction

Paste this into Claude's **custom instructions** (claude.ai → Settings → Profile → "What
personal preferences should Claude know about?"), Claude Desktop's preferences, or a
`CLAUDE.md` — anywhere it persists across conversations. Once it's there, you never have to
explicitly say "add this to Devcard" — just mention what happened, the way you'd tell a
colleague.

```
I keep a personal knowledge base called Devcard, reachable through its MCP tools
(add_skill, add_experience, add_project, add_education, update_profile, remove_skill,
search_profile, get_full_profile, get_resume_text). Treat it as the standing source of
truth for my skills, work history, and projects.

Whenever I mention something that belongs there — I learned a technology, shipped or
started a project, changed roles, finished a course, earned a certification — call the
matching tool yourself and persist it. Don't just acknowledge it in chat; actually write
it. Briefly confirm what you added afterward.

Rules:
- Call the specific tool (add_skill, add_project, etc.) directly. Never call
  update_knowledge_base — that tool exists only for callers with no LLM of their own, and
  you already have everything you need to parse my message yourself.
- Only record what I actually said. Don't infer skill levels, dates, or details I didn't
  give you — leave those fields blank rather than guess.
- If I say I left a job or stopped using something, don't delete or edit the existing
  entry automatically — tell me what you'd change and let me confirm first.
- If it's ambiguous whether something is a skill, a project, or a line of experience, make
  the reasonable call rather than asking — I'd rather you just record it.
- If the Devcard MCP tools aren't available in this conversation, say so plainly instead
  of pretending to have saved it.
```

---

## Prompt cheat sheet

Copy-paste starting points, once the standing instruction above is in place (or even
without it — these work as one-off requests too):

**Adding a skill**
> "I learned Kubernetes this week, add it as an intermediate skill"
> "I've been writing Go for a few years now, add that"

**Adding a project**
> "I shipped a Chrome extension called Devcard, add it as a project"
> "Add my side project 'kalshi-bot' — a Python trading bot using the Kalshi API"

**Adding / updating experience**
> "I just started at Acme Corp as a Senior Backend Engineer"
> "I've been a freelance developer since January 2023, add that to my experience"

**Education / certifications**
> "Add my B.Tech in Computer Science from XYZ University, 2018 to 2022"

**Updating your profile**
> "Update my headline to 'Full-stack engineer building AI products'"
> "Set my bio to: ..."

**Retrieving / searching**
> "What does my Devcard say about my React experience?"
> "Show me everything tagged with Docker"
> "Give me my full profile as JSON"

**Exporting**
> "Give me my resume as markdown"
> "Format my Devcard profile as a two-paragraph bio for a LinkedIn summary"

**Cleanup**
> "Remove jQuery from my skills, I don't use it anymore"
> "I left Acme Corp last month — what should we update?" *(asks first, per the standing rule)*

---

## 1. Claude Desktop / Claude Code

Once connected (see `mcp-server/README.md`), just talk normally — see the cheat sheet above
for examples. Claude reads your message and calls the right tool directly — `add_skill`,
`add_project`, `add_experience`, `add_education`, `update_profile`, `search_profile`,
`get_resume_text`, `get_full_profile`. It does **not** need a second AI call to do this (see
"How the two update paths differ" below) — it's just Claude using tools like any other MCP
server.

Claude Code with `--chrome` enabled can go further: since it has both your Devcard tools *and*
real browser control in the same session, you can ask it to read your profile and fill out an
actual job application form live, handling logins/CAPTCHAs itself. This is the most capable
(but least automated/hands-off) way to sync a profile anywhere.

---

## 2. Dashboard (`http://localhost:6366`)

Open it in a browser tab, or click the **install icon** in Chrome's address bar to get it as a
standalone app window (own taskbar icon, no browser chrome).

- **Knowledge base tab** — everything in your profile, in two views:
  - **Cards**: skills grouped by category, experience, projects, education, certifications
  - **Markdown**: a clean resume-formatted export. Toggle **Edit** to tweak wording, **Copy**
    to grab it for pasting into an actual resume or cover letter. (Edits here are local only —
    they don't change your stored profile; use Chat update or Claude for that.)
  - **Download PDF**: pick a template from the dropdown, click **Download PDF**. Two templates
    ship today:
    - **ATS Simple** (default) — single column, plain black text, no graphics or tables. Built
      to parse cleanly in applicant tracking systems; verified by extracting its text and
      confirming it reads in the same order as the visual layout.
    - **Modern** — same content, with color accents for a human reader. Not ATS-optimized —
      use ATS Simple for that.
    More templates just need adding to `mcp-server/src/pdf/registry.ts`; the picker updates
    itself.
- **Chat update tab** — the same natural-language update flow as the extension, full-size,
  with visible history of what each message changed.
- **Sync status tab** — which platforms (LinkedIn, Naukri, Indeed, Wellfound) have your
  current profile vs. are stale or never synced.
- **Light/dark toggle** — bottom-left of the sidebar.

---

## 3. Chrome extension

Click the toolbar icon for the same Profile / Chat / Sync tabs as the dashboard, in a popup.
The real power is what it injects into other pages:

- **On a known platform's edit page** (LinkedIn, Naukri, Indeed, Wellfound): a **"🧠 Sync with
  Devcard"** button appears, bottom-right. Click it to fill that page's form fields from your
  profile.
  ⚠️ **Current state**: the field selectors for these are mostly unverified placeholders (see
  `extension/README.md`) — they need to be checked against each site's real logged-in DOM
  before they'll reliably work. This is the biggest gap right now.
- **On any other site with a form** (a job application, a signup page, anything): a **"🧠 Fill
  with Devcard"** button appears if there's anything fillable. Click it and an AI call maps
  your profile onto whatever fields it finds — no site-specific code needed, works anywhere.
  Password/OTP/file/checkbox fields are never touched.

**A safety note on autofill**, worth repeating: this reads your own profile and types it into
fields on the page you're already logged into — no scraping, no third-party data sharing
except the AI provider call for the generic mapper. Platform policy risk is uneven though —
Naukri/Indeed/Wellfound are low-risk for occasional personal use; LinkedIn actively detects
and has banned accounts for extension-based automation, so treat that one carefully.

---

## How the two update paths differ

There are two ways a message becomes a profile change, and they're not the same:

- **You → Claude → tool call.** Claude reads your message itself and calls `add_skill` /
  `add_project` / etc. directly. No extra AI call, no API key spent beyond your normal Claude
  usage.
- **You → extension/dashboard chat box → `update_knowledge_base`.** There's no Claude in that
  loop — just raw text hitting the server — so the server runs its *own* AI call (configured
  via `AI_PROVIDER` = `anthropic` or `glm` in `mcp-server/.env`) to parse it. This is the only
  place a second API key actually gets used.

If you only ever talk to Devcard through Claude Desktop/Code, you don't need `AI_PROVIDER`
configured at all. It's there for the extension/dashboard's chat box, which has no LLM of its
own to lean on.

---

## What's not built yet

- **Portfolio site export** — not started.
- **LinkedIn adapter** — intentionally left as a stub (see the safety note above); it needs
  the most careful, rate-limited implementation of the four platforms.
- **Naukri/Indeed/Wellfound selectors** — present but unverified; you'll need to inspect your
  own logged-in DevTools and fix the `SELECTORS` const in each `extension/entrypoints/content/
  platforms/*.ts` file.

---

## Quick reference: PDF export

| Endpoint | What it does |
|---|---|
| `GET /api/pdf/templates` | Lists available templates (id, name, description, whether it's ATS-friendly) |
| `GET /api/pdf?template=ats` | Downloads the resume PDF using that template (`ats` is the default if omitted) |

---

## Quick reference: every MCP tool

| Tool | What it does |
|---|---|
| `update_knowledge_base(message)` | Parses raw text via the server's own AI call — for non-LLM callers only |
| `add_skill` / `remove_skill` / `list_skills` | Direct skill management |
| `add_experience` / `update_experience` | Work history |
| `add_project` / `update_project` | Projects |
| `add_education` | Education entries |
| `update_profile` | Name, headline, bio, contact info |
| `get_full_profile` | Everything, as structured JSON |
| `get_resume_text` | Everything, as clean Markdown |
| `search_profile` | Keyword search across skills/experience/projects |
