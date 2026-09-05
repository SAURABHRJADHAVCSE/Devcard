# Devcard — User Guide

One knowledge base about you. Update it once, in plain English, from wherever you happen to
be — and pull it back out however you need it: through Claude, or in a full dashboard.

This doc is "what can I actually do with this." For install/setup steps, see the root
`README.md` and `mcp-server/README.md`.

> The standing instruction and prompt cheat sheet below also live in the dashboard's
> **Guide** tab (`http://localhost:6366`) with a one-click copy button on every prompt —
> use that instead of copying out of this file day-to-day.

---

## The two ways in

| Surface | What it's for | Where |
|---|---|---|
| **Claude Desktop / Claude Code** | Talk to your knowledge base in natural language, no UI needed | Any Claude conversation, once connected |
| **Dashboard** | Browse everything at full size, export as Markdown | `http://localhost:6366` |

Both read and write the **same** SQLite database through the same MCP server — update
your skills from Claude on your phone via Cowork, and the dashboard on your laptop shows it
immediately.

Need your profile typed into an actual job application form on some other site? That's Claude
for Chrome's job now, not Devcard's — it already has this same knowledge base over MCP, and it
can see and act on the live page directly. A dedicated Devcard extension used to do this with
its own bespoke DOM-mapping code; removed 2026-09-05 since it was solving a problem Claude for
Chrome now solves without a second codebase to maintain.

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
search_profile, get_full_profile, get_resume_text, get_resume_pdf, list_resume_templates,
tailor_resume, save_resume_version, list_resume_versions, get_resume_version,
remove_resume_version, add_job_platform, remove_job_platform, list_job_platforms,
record_application, list_applications, update_application, remove_application). Treat it
as the standing source of truth for my skills, work history, projects, and job applications.

Whenever I mention something that belongs there — I learned a technology, shipped or
started a project, changed roles, finished a course, earned a certification — call the
matching tool yourself and persist it. Don't just acknowledge it in chat; actually write
it. Briefly confirm what you added afterward.

If I ask you to remove or delete something (a skill, job, project, or education entry),
look it up first (get_full_profile or search_profile) to find its id, confirm with me
which specific entry I mean if there's any ambiguity, then call the matching remove_*
tool. Don't remove anything I didn't explicitly ask to have removed.

If I ask you to find jobs or get me ready to apply, here's the full workflow, end to end:
call list_job_platforms first (register a new one with add_job_platform if I mention a site
that isn't there yet). If an Apify job-search tool is connected in this session, use it to
pull fresh postings from those platforms. Cross-check each posting against get_full_profile
and tell me how strong a match I am before doing anything else — don't tailor or save
anything for a posting I haven't seen. For the ones I want to move forward on: tailor_resume
(same missingSkills confirmation rule as always), then save_resume_version and get_resume_pdf.
I handle the actual submitting myself — by hand, or via Claude for Chrome if this session has
real browser control. Once I've applied, call record_application to log it, linked to that
resume version if one exists. You never submit an application yourself — Devcard has no
browser control, this whole chain stops at "resume ready" until I tell you I've applied.

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
- If I ask for my resume as a PDF, call get_resume_pdf directly. There's no separate PDF
  file to edit — it renders fresh from the profile every time, so if I want it to look
  different, edit the profile first (add_skill, update_experience, etc.) then call
  get_resume_pdf again. Its response includes a direct download link — always share that
  link with me, since some MCP clients (Claude Desktop, as of now) can't surface the file
  itself directly in chat.
- If I give you a job description, use tailor_resume, then show me its missingSkills before
  including any of them — never add a skill I haven't confirmed I actually have, and never
  add it to the real knowledge base even after I confirm, only to that resume version.
- For every job-specific resume, optimize for ATS parsing and recruiter readability using exact
  JD terminology only where my profile supports the claim. Treat an estimated 90+ match as a
  target, never a guarantee: show me the score rationale and remaining warnings, and do not
  inflate the number or imply that any resume guarantees an interview or selection.
- Render the final version with the polished template so the PDF stays single-column, readable,
  and selectable. Never use keyword stuffing, hidden text, graphics, tables, or unsupported claims.
- If you're not sure whether I actually applied to something, ask before calling
  record_application — never log an application on a guess.
```

---

## Prompt cheat sheet

Copy-paste starting points, once the standing instruction above is in place (or even
without it — these work as one-off requests too). Anything in `[brackets]` is a placeholder —
replace it with your own details before sending; everything else is literal.

**Adding a skill**
> "I learned Kubernetes this week, add it as an intermediate skill"
> "I've been writing Go for a few years now, add that"

**Adding a project**
> "I shipped a side project called Pulsecheck, an AI-powered uptime monitor, add it as a project"
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
> "Generate my resume as a polished ATS-readable PDF. Keep it single-column and selectable,
> use standard section headings, and include only facts already stored in my Devcard profile.
> Give me the download link."
> "Format my Devcard profile as a two-paragraph bio for a LinkedIn summary"

**Tailoring a resume to a job** *(works the same from Claude Code, Claude Desktop, or any other MCP-connected tool)*
> "Here's a job description:
>
> [paste the JD]
>
> Create the strongest truthful ATS-ready version of my Devcard resume for this exact role:
> 1. Call tailor_resume with the full JD and my real profile.
> 2. Show me the proposed summary, ordered matched skills, featured projects,
>    estimatedMatchScore, scoreRationale, atsWarnings, and missingSkills before saving anything.
> 3. Target an estimated match of 90+ only when my stored evidence genuinely supports every
>    major requirement. Use exact JD terminology where truthful, preserve real metrics,
>    prioritize required qualifications, and remove generic filler. Never keyword-stuff or
>    invent experience, skills, dates, credentials, or results.
> 4. If missingSkills contains anything I may actually know, ask me to confirm it. Do not add
>    an unconfirmed skill and do not inflate the score to reach 90. If the truthful estimate
>    remains below 90, explain the specific gaps instead of claiming success.
> 5. After I approve, save the complete ordered skill and project lists with
>    save_resume_version using '<Company> - <Role>', then call get_resume_pdf for that version
>    with the polished template and give me the download link.
> 6. Confirm that the result is a single-column, selectable-text PDF with standard headings.
>    Do not claim that an ATS score guarantees an interview or selection; optimize the factors
>    we can control and report the remaining risks honestly."

**Getting an honest resume audit** *(no job description needed — a general quality critique)*
> "Act as an expert recruiter reviewing my resume. Pull my full profile with get_full_profile
> (or get_resume_text), then tell me honestly: why might a recruiter reject this? Which
> important skills or achievements are underrepresented or missing entirely? Which parts should
> be emphasized more, and which are weak filler that should be cut? Be specific and critical —
> I'd rather hear it now than after 50 rejections."

**Finding roles you're a strong match for** *(no job description needed — analyzes your whole profile)*
> "Act as an expert technical recruiter. Pull my full profile with get_full_profile, then
> identify 10 specific job titles where I'm an 80%+ match with the highest realistic chance of
> landing an interview — target industry/location: [fill in]. For each, give me: Job Title |
> Estimated Match % | Why I'm a Strong Fit | Top 3 Missing Keywords to Add | Where to Search.
> Base every claim on what's actually in my profile — no inflating my fit to hit round numbers."

**Finding and prepping fresh jobs with Apify** *(needs an Apify job-search tool connected in
this session — this workflow ends at "resume ready," it doesn't submit anything itself)*
> "Find and prepare fresh job applications for me, step by step:
> 1. Call list_job_platforms and search those sites (register a new one with add_job_platform
>    if I mention one that isn't there yet).
> 2. Search for fresh [job title(s)] openings posted in the last [N] days, using the Apify job
>    tool.
> 3. For each posting, pull its JD text and cross-check it against my Devcard profile
>    (get_full_profile). Rank roles by a conservative estimated match and prioritize roles
>    where my truthful profile can credibly reach 90+ after tailoring.
> 4. For each strong match, run tailor_resume and show estimatedMatchScore, scoreRationale,
>    atsWarnings, and missingSkills. Ask before including any missing skill and never inflate
>    a score. Then save_resume_version named '<Company> - <Role>' and generate the polished
>    PDF with get_resume_pdf.
> 5. Give me one final table: Job Title | Company | Estimated Match | Evidence | Remaining
>    Gaps | Resume Version | PDF link. Never imply that a score guarantees an interview.
> I'll handle the actual submitting myself, or via Claude for Chrome — your job stops at
> 'resume ready.'"

**Logging an application you just submitted** *(after you actually apply, via Claude for Chrome or by hand)*
> "I just applied to [Role] at [Company] on [platform/URL]. Log it with record_application,
> and link it to the '<Company> — <Role>' resume version if I saved one for it."

**Cleanup**
> "Remove jQuery from my skills, I don't use it anymore"
> "I left Acme Corp last month — what should we update?" *(asks first, per the standing rule)*

---

## 1. Claude Desktop / Claude Code

Once connected (see `mcp-server/README.md`), just talk normally — see the cheat sheet above
for examples. Claude reads your message and calls the right tool directly — `add_skill`,
`add_project`, `add_experience`, `add_education`, `add_certification`, `update_profile`,
`search_profile`, `get_resume_text`, `get_full_profile`, `get_resume_pdf`, `tailor_resume`,
`save_resume_version`. It does **not** need a second AI call to do this (see
"How the two update paths differ" below) — it's just Claude using tools like any other MCP
server.

Claude Code with `--chrome` enabled (or Claude for Chrome) can go further: since it has both
your Devcard tools *and* real browser control in the same session, you can ask it to read your
profile and fill out an actual job application form live, handling logins/CAPTCHAs itself. This
is the most capable (but least automated/hands-off) way to sync a profile anywhere — and the
replacement for what a dedicated Devcard browser extension used to do with its own bespoke
DOM-mapping code.

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
  - **Polished** (default) — centered header, Inter typeface, dark-navy accents (`#1a2e4a`),
    colored section rules (no underline on the real hyperlinks — an earlier default-underline
    rendering artifact was removed), standard section headings ("Professional Summary", "Work
    Experience"), structured contact and link rows, and
    technical skills placed right after the summary — ahead of experience, per standard
    developer-resume guidance. Website/GitHub/LinkedIn links and project URLs render as real
    clickable PDF hyperlinks, not just colored text. Also the only template that renders
    `**bold**`-marked spans in your bio/bullet text as real bold emphasis (write `**like
    this**` in a description to have specific phrases stand out). Title/dates stay stacked
    rather than right-aligned on one line — a right-aligned row was tried and measured (see
    `primitives.tsx:EntryHeading`): it looks fine on screen but corrupts ATS reading order, so
    it was reverted. Downloads as `FirstName-LastName-Resume.pdf`. The template is ATS-readable:
    it uses a single column, real selectable text, standard headings, clean reading order, and
    no tables, icons, text boxes, hidden keywords, or rasterized content. Styling cannot guarantee
    an ATS score or shortlist; job-specific content fit still depends on the truthful profile data.

    **Content is curated, not just laid out**, to help real content actually fit one page:
    Education shows only your single highest/most recent entry (standard practice once you
    have a degree and work experience — a Bachelor's implies the high school behind it), and
    Projects shows only the ones flagged `featured` in your profile (falls back to showing all
    of them if none are flagged). Both apply automatically to a plain live-profile render; for
    a saved resume version, an explicit `projectNames` curation from tailoring is always
    respected exactly as chosen, even if it names a non-featured project — see
    `pdf/tailor.ts:applyResumeVersion`, which every render path calls unconditionally (with no
    version, not just when one exists) specifically so this default and an explicit
    curation can't step on each other.

    **Inter is embedded, not base-14** — the one deliberate exception to the base-14-only rule
    every other template follows, added by explicit request. Verified before shipping, not
    assumed: WOFF2 crashes fontkit's glyph embedding outright, but plain WOFF embeds cleanly
    and `pdftotext` extraction — including classic ligature-prone words ("office", "fluffy",
    "waffle") — comes back correct (see `mcp-server/src/pdf/setup.ts`). Adds real file weight
    (~25KB for a full resume vs. a few KB unembedded) — still trivial for any upload/email
    limit, but worth knowing it's there.

  Four other templates (ATS Simple, Classic, Modern, Executive) were built during the earlier
  ATS audit and are still sitting, working and tested, in `mcp-server/src/pdf/templates/` — just
  unregistered from `registry.ts` by request, to keep only Polished active for now. This repo
  has no git, so they were left in place rather than deleted; re-enabling one is a one-line
  import + registry entry, no rewrite needed.

  Every template shares one underlying layout engine (`mcp-server/src/pdf/`): real selectable
  text (never rasterized), correct top-to-bottom reading order (Polished's embedded-Inter
  exception aside), and blank PDF creator/producer metadata (no tool branding in the file).
  Margins (0.5–0.75in), line-height (1.15–1.25), and font sizes (name 20–24pt, section headers
  11–12pt with slightly increased letter-spacing, job title/company 10.5–11pt, body 10–10.5pt,
  dates/location 9.5–10pt) are pinned to specific resume-design ranges and held constant across
  three density tiers (`comfortable`/`compact`/`veryCompact`) in `density.ts` — a resume
  auto-fits to one page by progressively tightening *inter-element spacing* through those first
  (4–6pt after a section header, 6–8pt between job entries — also pinned). A 4th tier,
  `ultraCompact`, is a deliberate, explicitly-requested last resort tried only after those three
  fail — one page is a hard requirement even when honest content volume doesn't fit within the
  normal ranges, so this tier is allowed to dip slightly below them (down to ~9.5pt body, 1.1
  line-height, ~0.44in/0.55in margins). Content curation (featured-only projects, single latest
  education entry — see above) does most of the real work here in practice; `ultraCompact`
  exists for whatever gap curation alone doesn't close. If a resume still doesn't fit even at
  `ultraCompact`, it prints as two pages — genuinely too much content for one page at any
  readable size, not something further shrinking should try to solve; trim content instead (per
  the spec's own bullet-craft rules: 3–5 bullets per role, 1–2 lines each, cut anything without
  a specific result). Run `bun run test` in `mcp-server/` to re-validate whatever's currently registered against a
  set of synthetic resume fixtures (short/medium/dense/long-content) any time the PDF code
  changes.

  Adding/re-enabling a template just needs an import plus one entry in
  `mcp-server/src/pdf/registry.ts`; the Resumes tab picks it up automatically.
- **Tailor tab** — paste a job description (and optionally a separate required-skills list),
  click Analyze, and an AI call proposes a tailored professional summary, which of your real
  skills to feature (most relevant first), and which real projects to lead with — built only
  from what's actually in your profile. If the JD wants a skill you don't have listed, it
  shows up as an off-by-default toggle: click it to include that skill **on this resume
  only** — it's never written back to your real knowledge base, so your Devcard profile can't
  quietly drift out of sync with reality. Save it with a name and it becomes a permanent,
  redownloadable version — download its PDF anytime via the same button, or delete it when
  you're done with that application. Everything here also works from Claude (see the cheat
  sheet's "Tailoring a resume to a job" prompt) or any other MCP-connected tool, via
  `tailor_resume` / `save_resume_version` / `list_resume_versions` / `get_resume_version` /
  `remove_resume_version`, and `get_resume_pdf` accepts a `versionId` to render a saved one.
- **Chat update tab** — a natural-language update flow, full-size, with visible history of
  what each message changed.
- **Applications tab** — two things: the job platforms you actually use (name + base URL —
  tells Claude which sites to search, and auto-labels an application's platform from its
  posting URL when they match), and a table of every job you've actually applied to (company,
  role, platform, date, status, linked resume PDF if one was tailored for it). Add a platform
  or record an application right from the tab, or let Claude do both via `add_job_platform` /
  `list_job_platforms` / `record_application` / `list_applications` / `update_application` (see
  the cheat sheet's Apify and "logging an application" prompts) — same underlying data either
  way.
- **Light/dark toggle** — bottom-left of the sidebar.

---

## How the two update paths differ

There are two ways a message becomes a profile change, and they're not the same:

- **You → Claude → tool call.** Claude reads your message itself and calls `add_skill` /
  `add_project` / etc. directly. No extra AI call, no API key spent beyond your normal Claude
  usage.
- **You → dashboard chat box → `update_knowledge_base`.** There's no Claude in that
  loop — just raw text hitting the server — so the server runs its *own* AI call (configured
  via `AI_PROVIDER` = `anthropic` or `glm` in `mcp-server/.env`) to parse it. This is the only
  place a second API key actually gets used.

If you only ever talk to Devcard through Claude Desktop/Code, you don't need `AI_PROVIDER`
configured at all. It's there for the dashboard's chat box, which has no LLM of its
own to lean on.

---

## Quick reference: PDF export

| Endpoint | What it does |
|---|---|
| `GET /api/pdf/templates` | Lists available templates (id, name, description, whether it's ATS-friendly) |
| `GET /api/pdf?template=polished` | Downloads the ATS-readable resume PDF (`polished` is the default if omitted) |
| `GET /api/pdf?template=polished&disposition=inline` | Same PDF, served for in-page viewing (used by the Resumes tab's preview) instead of triggering a download |
| `GET /api/pdf?version=<id>` | Renders a saved, tailored resume version instead of the live profile as-is |
| `POST /api/resume-versions/tailor` | `{jobDescription, requiredSkills?}` → AI analysis (summary, ordered matches/projects, missing skills, conservative estimated score, rationale, warnings) — doesn't save anything |
| `GET` / `POST` / `DELETE /api/resume-versions[/:id]` | List, save, and delete saved resume versions |

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
| `get_resume_pdf` / `list_resume_templates` | The actual PDF file (base64), and which templates exist. `get_resume_pdf` takes an optional `versionId`, and always also returns a direct `http://localhost:6366/api/pdf?...` download link as text — some MCP clients (Claude Desktop, as of now) don't surface the base64 file itself in chat, so the link is the reliable way to actually get the PDF |
| `tailor_resume` | Analyzes a JD against the real profile; proposes summary/matchedSkills/missingSkills/suggestedProjects — saves nothing |
| `save_resume_version` / `list_resume_versions` / `get_resume_version` / `remove_resume_version` | Save, list, inspect, and delete named tailored resume versions |
| `add_job_platform` / `list_job_platforms` / `remove_job_platform` | Job sites you actually use (name + base URL) — check before a job search instead of asking every time |
| `record_application` / `list_applications` / `update_application` / `remove_application` | Log a job you actually applied to (auto-labels platform from `jobUrl` when it matches a registered one), list them, update status/notes, or delete one |
| `search_profile` | Keyword search across skills/experience/projects |
