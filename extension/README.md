# devcard extension

The hands of Devcard: a Chrome MV3 extension (WXT + React + Tailwind v4) that reads/writes
the profile via the `mcp-server` HTTP API and fills form fields anywhere with it. There used
to be hardcoded-selector adapters for LinkedIn/Naukri/Indeed/Wellfound — all dropped by
request in favor of the generic AI field mapper handling every site uniformly, no manual DOM
inspection needed for any of them anymore.

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
- `entrypoints/content/` — injects a "🧠 Fill with Devcard" button on any page with fillable
  fields (`platforms/generic.ts`). `platforms/base.ts` holds the shared button-injection and
  form-fill helpers.

## Known issue: extension→server POST/PATCH may hang (unconfirmed in real Chrome)

In automated Chrome testing, every `fetch()` from `background.ts` that needs a CORS preflight
(any POST/PATCH with a JSON body — filling fields, chat updates, profile edits) hung
indefinitely, while simple requests (GET, header-less POST) worked instantly. Added the
`Access-Control-Allow-Private-Network: true` preflight header Chrome's Private Network Access
policy requires for an extension reaching `localhost` (`mcp-server/src/api/router.ts`) —
confirmed present via `curl`, but the hang persisted even with it, and even with PNA
enforcement flags explicitly disabled via Chrome launch args. Best guess: a native Chrome
permission prompt gating local-network access, which needs a human to click "Allow" — something
an automated browser can never do, meaning this might not reproduce in normal use at all.
**Needs verification in a real, non-automated Chrome** (load unpacked via chrome://extensions)
before trusting this note either way.
