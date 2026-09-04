# Devcard — User Guide

One knowledge base about you. Update it once, in plain English, from wherever you happen to
be — and pull it back out however you need it: through Claude, in a full dashboard, or
autofilled straight into a job site's form.

This doc is "what can I actually do with this." For install/setup steps, see the root
`README.md` and `mcp-server/README.md`.

> The standing instruction and prompt cheat sheet below also live in the dashboard's
> **Guide** tab (`http://localhost:6366`) with a one-click copy button on every prompt —
> use that instead of copying out of this file day-to-day.

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
(add_skill, add_experience, add_project, add_education, add_certification, update_profile,
remove_skill, remove_experience, remove_project, remove_education, remove_certification,
search_profile, get_full_profile, get_resume_text). Treat it as the standing source of
truth for my skills, work history, and projects.

Whenever I mention something that belongs there — I learned a technology, shipped or
started a project, changed roles, finished a course, earned a certification — call the
matching tool yourself and persist it. Don't just acknowledge it in chat; actually write
it. Briefly confirm what you added afterward.

If I ask you to remove or delete something (a skill, job, project, or education entry),
look it up first (get_full_profile or search_profile) to find its id, confirm with me
which specific entry I mean if there's any ambiguity, then call the matching remove_*
tool. Don't remove anything I didn't explicitly ask to have removed.

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
> "I passed the AWS Certified Cloud Practitioner exam in March 2025, expires March 2028"

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
`add_project`, `add_experience`, `add_education`, `add_certification`, `update_profile`,
`search_profile`, `get_resume_text`, `get_full_profile`. It does **not** need a second AI
call to do this (see
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
    (name, issuer, issued/expiry date). Hover any skill or entry card for a small **×** —
    click it (then confirm) to permanently remove that entry from your stored profile. This
    is a real delete against the database, not local-only, and there's no undo beyond
    re-adding it — the confirm dialog means it, treat it as permanent.
  - **Markdown**: a clean resume-formatted export. Toggle **Edit** to tweak wording, **Copy**
    to grab it for pasting into an actual resume or cover letter. (Edits here are local only —
    they don't change your stored profile; use the delete buttons above, Chat update, or Claude
    for that.)
- **Resumes tab** — a card per template, each with a live inline preview and its own
  **Open full size** / **Download PDF** buttons. Only one template is registered right now:
  - **Polished** (default) — centered header, dark-navy accents, colored section rules,
    standard section headings ("Professional Summary", "Work Experience"), and technical
    skills placed right after the summary — ahead of experience, per standard developer-resume
    guidance. Website/GitHub/LinkedIn links and project URLs render as real clickable PDF
    hyperlinks, not just colored text. Also the only template that renders `**bold**`-marked
    spans in your bio/bullet text as real bold emphasis (write `**like this**` in a description
    to have specific phrases stand out). Title/dates stay stacked rather than right-aligned on
    one line — a right-aligned row was tried and measured (see `primitives.tsx:EntryHeading`):
    it looks fine on screen but corrupts ATS reading order, so it was reverted. Not
    ATS-optimized overall (relies on color for section headers).

  Four other templates (ATS Simple, Classic, Modern, Executive) were built during the earlier
  ATS audit and are still sitting, working and tested, in `mcp-server/src/pdf/templates/` — just
  unregistered from `registry.ts` by request, to keep only Polished active for now. This repo
  has no git, so they were left in place rather than deleted; re-enabling one is a one-line
  import + registry entry, no rewrite needed.

  Every template shares one underlying layout engine (`mcp-server/src/pdf/`): real selectable
  text (never rasterized), correct top-to-bottom reading order, base-14 fonts only (so nothing
  depends on font embedding), and blank PDF creator/producer metadata (no tool branding in the
  file). Margins (0.5–0.6in), line-height (1.15–1.25), and font sizes (name 18–22pt, section
  headers 13–14pt, body 10–11pt) are pinned to standard resume-design ranges and held constant
  across densities in `density.ts` — a resume auto-fits to one page by progressively
  tightening *inter-element spacing* through three density tiers first, and only prints as two
  pages if content still doesn't fit at the tightest tier without breaking those ranges (this
  is expected/normal for an extensive-experience resume, not a bug). Run `bun run test` in
  `mcp-server/` to re-validate whatever's currently registered against a set of synthetic
  resume fixtures (short/medium/dense/long-content) any time the PDF code changes.

  Adding/re-enabling a template just needs an import plus one entry in
  `mcp-server/src/pdf/registry.ts`; the Resumes tab picks it up automatically.
- **Chat update tab** — the same natural-language update flow as the extension, full-size,
  with visible history of what each message changed.
- **Sync status tab** — which platforms (Naukri, Indeed, Wellfound) have your current profile
  vs. are stale or never synced.
- **Light/dark toggle** — bottom-left of the sidebar.

---

## 3. Chrome extension

Click the toolbar icon for the same Profile / Chat / Sync tabs as the dashboard, in a popup.
The real power is what it injects into other pages:

- **On any site with a form** — any job application, LinkedIn, Naukri, Indeed, Wellfound,
  a signup page, anything: a **"🧠 Fill with Devcard"** button appears if there's anything
  fillable. Click it and an AI call maps your profile onto whatever fields it finds — no
  site-specific code, no manually-maintained CSS selectors, works anywhere. Password/OTP/
  file/checkbox fields are never touched.

**Why there's only one mechanism now**: this used to be two systems — hardcoded-selector
adapters for Naukri/Indeed/Wellfound (fast, free, but needed someone to manually inspect each
site's logged-in DOM and re-verify whenever the site redesigned) plus the AI mapper for
everything else. Both dropped by request in favor of the AI mapper for every site uniformly —
one code path, zero manual DOM work ever, at the cost of a small AI call per fill. Naukri/
Indeed/Wellfound still get marked in the Sync status tab after a successful fill (by hostname,
not by a dedicated adapter) — see `KNOWN_JOB_PLATFORMS` in `extension/entrypoints/content/
index.ts`.

**A safety note on autofill**, worth repeating: this reads your own profile and types it into
fields on the page you're already logged into — no scraping, no third-party data sharing
except the AI provider call. LinkedIn actively detects/bans extension-based automation more
than most sites — the AI-mapper's active, one-click-per-use shape is lower-risk than passive
background automation would be, but still don't rely on it there for frequent/bulk use.

⚠️ **Known issue, unresolved**: while testing this, the extension's background→server `fetch()`
calls that need a CORS preflight (any POST/PATCH with a JSON body — which is every meaningful
action: filling fields, chat updates, profile edits) hung indefinitely in automated Chrome
testing, while simple requests (plain GET, header-less POST) worked instantly. Root-caused it
partway: Chrome's Private Network Access policy requires an `Access-Control-Allow-Private-
Network: true` header on the preflight response for a `chrome-extension://` origin reaching
`localhost` — added that (`mcp-server/src/api/router.ts`), confirmed via `curl` that the header
is now present — but the hang persisted even with it in place and even with Chrome's PNA
enforcement flags explicitly disabled. Most likely explanation: a native Chrome permission
prompt gating local-network access that needs a human to click "Allow," which an automated
browser can never do — meaning this may not reproduce for you at all in normal use. **Please
test the actual "🧠 Fill with Devcard" button yourself** (load unpacked via chrome://extensions,
not automation) and report back — if it hangs for you too, this needs more investigation; if it
works, the PNA header fix was sufficient and this note can come out.

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

- **Platform-specific adapters (LinkedIn, Naukri, Indeed, Wellfound)** — dropped entirely by
  request, not planned. Every site uses the generic AI field mapper instead (see above), so
  there's no more manual selector-verification homework.
- **The CORS/autofill hang noted above** — needs you to test the real button in a real,
  non-automated Chrome and report back.

---

## Quick reference: PDF export

| Endpoint | What it does |
|---|---|
| `GET /api/pdf/templates` | Lists available templates (id, name, description, whether it's ATS-friendly) |
| `GET /api/pdf?template=ats` | Downloads the resume PDF using that template (`ats` is the default if omitted) |
| `GET /api/pdf?template=ats&disposition=inline` | Same PDF, served for in-page viewing (used by the Resumes tab's preview) instead of triggering a download |

---

## Quick reference: every MCP tool

| Tool | What it does |
|---|---|
| `update_knowledge_base(message)` | Parses raw text via the server's own AI call — for non-LLM callers only |
| `add_skill` / `remove_skill` / `list_skills` | Direct skill management |
| `add_experience` / `update_experience` / `remove_experience` | Work history |
| `add_project` / `update_project` / `remove_project` | Projects |
| `add_education` / `remove_education` | Education entries |
| `add_certification` / `remove_certification` | Certifications (name, issuer, issued/expiry date) |
| `update_profile` | Name, headline, bio, contact info |
| `get_full_profile` | Everything, as structured JSON |
| `get_resume_text` | Everything, as clean Markdown |
| `search_profile` | Keyword search across skills/experience/projects |
