# devcard extension

The hands of Devcard: a Chrome MV3 extension (WXT + React + Tailwind v4) that reads/writes
the profile via the `mcp-server` HTTP API and syncs it into LinkedIn/Naukri/Indeed/Wellfound
form fields.

## Setup

```bash
npm install       # bun install currently hits a Windows/AV EPERM lock on this machine, see mcp-server/README.md
npm run dev        # wxt dev — loads unpacked into Chrome for you
# or: npx wxt build, then load .output/chrome-mv3 as an unpacked extension manually
```

Make sure `mcp-server` is running on `:6366` first (see `../mcp-server/README.md`).

## Architecture

- `entrypoints/background.ts` — the only place that calls `fetch(localhost:6366/...)`. Content
  scripts and popup pages talk to it via `chrome.runtime.sendMessage` (see `lib/api.ts`).
- `entrypoints/popup/` — the browser-action popup: Profile / Chat / Sync / Settings tabs.
- `entrypoints/content/` — injects a "Sync with Devcard" button on platform edit pages.
  `platforms/base.ts` defines the adapter interface; each platform is one isolated file.

## Known gap: platform selectors are unverified

`platforms/naukri.ts`, `indeed.ts`, `wellfound.ts`, `linkedin.ts` all have a `SELECTORS` const
with a `TODO(you)` comment — these need to be filled in / corrected by inspecting your own
logged-in profile-edit page in DevTools (these pages sit behind login, so they couldn't be
verified from here). LinkedIn in particular has no dedicated edit URL — editing happens through
per-section modals — so `linkedinAdapter.syncProfile()` is currently a stub that reports failure
with an explanation. Update the "Last verified" comment in each file with the date you check it,
since these selectors WILL drift.
