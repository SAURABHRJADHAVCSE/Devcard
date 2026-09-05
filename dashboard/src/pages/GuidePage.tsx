import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

// Kept in sync by hand with the "Keep it always in sync" / "Prompt cheat
// sheet" sections of the root GUIDE.md — that file stays the deeper
// reference (setup, architecture, what's not built), this page exists so
// the prompts themselves are one click to copy instead of a file to find.

const STANDING_INSTRUCTION = `I keep a personal knowledge base called Devcard, reachable through its MCP tools
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
that isn't there yet). Then actually search those platforms for fresh postings: navigate to
each registered platform's own search directly (e.g. via Claude for Chrome) and use its
filters — that's the default, since applying happens on that same site anyway. Use an Apify
job-search tool instead only when I'm not searching through a specific job portal (or want a
broader sweep) — that's what it's actually good for, crawling the wider internet for postings,
not standing in for a portal's own search. Before doing anything else with a posting, check
list_applications — if I've already applied to that exact company + role (or the same
jobUrl), skip it and don't tailor or apply again, just note it was already applied to.
Otherwise cross-check it against get_full_profile and tell me how strong a match I am — don't
tailor or save anything for a posting I haven't seen. For the ones I want to move forward on:
tailor_resume (same missingSkills confirmation rule as always), then save_resume_version and
get_resume_pdf. If tailor_resume itself fails or isn't available (e.g. no AI provider key
configured on the server), don't stop — do the analysis yourself directly: compare the JD
against get_full_profile's real data, write the tailored summary, pick matched skills, and
flag any JD-required skill that isn't in the profile before including it, same rules as if
tailor_resume had produced it — including the hard numeric limits tailor_resume enforces in
code, which you have to enforce yourself when doing this manually: summary under 500
characters (roughly 2-3 sentences, not a paragraph), at most 18 matched skills. Those limits
exist because the PDF has to fit one page — a longer summary or skill list you write by hand
is exactly as likely to blow the page budget as a JD-required skill you invent, so treat both
as equally real mistakes. save_resume_version and get_resume_pdf don't need any AI
provider configured, so they still work either way. For the actual applying, use the Claude in
Chrome browser extension specifically — the one running in my real Chrome browser, where I'm
already logged into these job sites — never a generic/internal/sandboxed web-browsing or
fetch tool. Only my real browser session has those logins, so only that extension can actually
get through a job portal's login wall and submit something; a sandboxed tool will just hit the
login page and stall, which is not a reason to give up and hand me links instead. If this
session has that extension connected: open the posting, fill in the form fields from my
profile the same way you'd fill any form, and submit it. If the form has a real file-upload
field for the resume (not just pasted text), use the exact local file path get_resume_pdf gave
you for that version to attach it — never a download link or a guessed path. Pause and tell me
if you hit a CAPTCHA or a login wall it genuinely can't get through, rather than guessing or
claiming you submitted something you didn't. If it isn't connected, say so plainly and hand me
the tailored
resume so I can apply myself — don't quietly fall back to a sandboxed browser and pretend
that's the same thing. Either way, once an application is actually submitted, call
record_application to log it, linked to that resume version.

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
- Any platform already in list_job_platforms is my standing permission to search and apply
  there — don't ask me for permission per job or per platform once it's registered. The
  truthfulness rules above still always apply regardless (confirm before including a missing
  skill, never inflate a match score) — those are accuracy checks, not permission checks, and
  standing permission to apply never overrides them.`;

// ChatGPT has no live connection to Devcard (it only accepts a remote HTTP/SSE MCP server,
// which this project doesn't run yet — see GUIDE.md), so this isn't a weaker rewrite of the
// same instructions, it's a genuinely different job: never claim to save anything, always work
// from what's actually pasted into the conversation rather than chat memory or guesswork, and
// say plainly when something (live search, applying, logging) needs Claude instead.
const STANDING_INSTRUCTION_CHATGPT = `I keep a personal knowledge base called Devcard, but you don't have a live connection to it —
so treat whatever resume/profile text I paste into this conversation as the current, complete
truth, not something to remember from earlier chats or infer on your own.

Whenever I mention something that belongs in Devcard — I learned a technology, shipped or
started a project, changed roles, finished a course, earned a certification — don't try to
save it anywhere yourself. Remind me to add it to Devcard directly (through Claude, or the
Devcard dashboard) so it stays the single source of truth, then use it as context for the
rest of this conversation only.

For resume tailoring, an honest audit, or finding roles I'm a strong match for, ask me to
paste my current resume text if I haven't already, then follow the same truthfulness rules
Devcard itself enforces: never invent a skill, achievement, metric, or credential that isn't
in what I pasted; if a job description wants something I don't have, tell me plainly rather
than assuming or working around it.

Rules:
- Never claim to have saved, updated, or synced anything to Devcard — you can't. If I ask you
  to "add this to my profile," tell me to do it through Claude or the dashboard instead.
- Only work from what I've actually pasted into this conversation, not what a past ChatGPT
  conversation may have said about my background — Devcard, not chat memory, is the source of
  truth, and old context can go stale.
- If I paste a job description, tailor my resume the same way Devcard's own tailoring would:
  lead with my most relevant true qualification, keep the summary to 2-3 sentences, flag any
  required skill I don't have rather than assuming I have it.
- Live job search, actually applying to postings, and logging applications need Devcard's MCP
  tools and real browser control — I have to do those through Claude, not you. If I ask for
  them here, say so plainly rather than attempting a weaker version.`;

// STANDING_INSTRUCTION's source is manually wrapped at ~95 chars/line for
// readability in the code — rendering that raw with `white-space: pre-wrap`
// would turn every source line break into a hard line break in the UI
// (narrow, ragged column with dead space beside it) instead of letting the
// browser reflow to fill the card. This joins wrapped continuation lines
// back into one line per paragraph/bullet, while still preserving genuine
// breaks: blank lines (paragraph boundaries) and lines starting a new
// bullet ("- "). Only affects display — the raw constant (with its
// original line breaks) is still what the Copy button copies, which is
// harmless since line-wrap position doesn't matter to Claude reading it.
function formatForDisplay(text: string): string {
  const lines = text.split("\n");
  return lines
    .reduce<string[]>((out, line) => {
      const prev = out[out.length - 1];
      const startsNewBlock = line.trim() === "" || line.trim().startsWith("- ") || prev === undefined || prev.trim() === "";
      if (startsNewBlock) {
        out.push(line);
      } else {
        out[out.length - 1] = `${prev} ${line.trim()}`;
      }
      return out;
    }, [])
    .join("\n");
}

interface PromptVariant {
  text: string;
  note?: string;
}

// `text`/`note` is always the Claude version — it calls Devcard's MCP tools
// by name (get_full_profile, tailor_resume, ...) and assumes they're live
// in this session. `chatgpt` is the equivalent ChatGPT Work flow: it uses
// ChatGPT's built-in browser to operate the local Devcard dashboard and a
// connected Chrome profile for job sites that require the user's login.
interface Prompt extends PromptVariant {
  chatgpt?: PromptVariant;
}

const CHEAT_SHEET: { title: string; prompts: Prompt[] }[] = [
  {
    title: "Tailoring a resume to a job",
    prompts: [
      {
        text: `Here's a job description:

[paste the JD]

Create the strongest truthful ATS-ready version of my Devcard resume for this exact role:
1. Call tailor_resume with the full JD and my real profile.
2. Show me the proposed summary, ordered matched skills, featured projects, estimatedMatchScore, scoreRationale, atsWarnings, and missingSkills before saving anything.
3. Target an estimated match of 90+ only when my stored evidence genuinely supports every major requirement. Use exact JD terminology where truthful, preserve real metrics, prioritize required qualifications, and remove generic filler. Never keyword-stuff or invent experience, skills, dates, credentials, or results.
4. If missingSkills contains anything I may actually know, ask me to confirm it. Do not add an unconfirmed skill and do not inflate the score to reach 90. If the truthful estimate remains below 90, explain the specific gaps instead of claiming success.
5. After I approve, save the complete ordered skill and project lists with save_resume_version using '<Company> - <Role>', then call get_resume_pdf for that version with the polished template and give me the download link.
6. Confirm that the result is a single-column, selectable-text PDF with standard headings. Do not claim that an ATS score guarantees an interview or selection; optimize the factors we can control and report the remaining risks honestly.`,
        note: "Works the same from Claude Code, Claude Desktop, or any other MCP-connected tool",
        chatgpt: {
          text: `Create the strongest truthful, one-page ATS resume I can submit for the job below.

Use ChatGPT's built-in browser to open http://localhost:6366 and treat my Devcard Knowledge base as the only source of truth about me. Use the Tailor tab to analyze the full job description. You may reorder, tighten, and rephrase supported content, but do not invent or exaggerate any skill, responsibility, metric, date, credential, or result.

Success means:
- the opening summary leads with my strongest evidence for this role and stays under 500 characters;
- the skills list contains at most 18 truthful, role-relevant skills in priority order;
- JD terminology is used only where Devcard supports it;
- the best supported projects and experience are emphasized, generic filler is removed, and the PDF remains a readable single-column page;
- the honest score, rationale, ATS warnings, and unresolved gaps are reported without implying an interview guarantee.

Before saving, give me one compact review containing: proposed summary, matched skills, featured projects, estimated match, score rationale, ATS warnings, and missing skills. If a missing skill could materially improve the resume, ask only whether I genuinely have that skill; leave it off unless I confirm it. If no clarification is needed, ask for one approval to save.

After approval, save the version as '<Company> - <Role>', generate the polished PDF, inspect the final preview for overflow or obvious layout problems, and give me the exact saved version and PDF filename or download.

Job description:
[paste the full JD]`,
          note: "Outcome-first ChatGPT prompt — uses your live Devcard profile and verifies the final PDF",
        },
      },
    ],
  },
  {
    title: "Getting an honest resume audit",
    prompts: [
      {
        text: `Act as an expert recruiter reviewing my resume. Pull my full profile with get_full_profile (or get_resume_text), then tell me honestly: why might a recruiter reject this? Which important skills or achievements are underrepresented or missing entirely? Which parts should be emphasized more, and which are weak filler that should be cut? Be specific and critical — I'd rather hear it now than after 50 rejections.`,
        note: "No job description needed — a general quality critique",
        chatgpt: {
          text: `Audit my current resume like a skeptical senior technical recruiter deciding whether to interview me.

Use ChatGPT's built-in browser to open http://localhost:6366. Read the complete Knowledge base in Markdown view and inspect the polished resume preview. Treat Devcard as the source of truth. Do not edit or save anything.

Diagnose the resume, not me. Separate problems into:
1. evidence or achievements that exist but are buried or weakly written;
2. important information genuinely absent from Devcard;
3. irrelevant filler, repetition, vague claims, and ATS/readability risks;
4. positioning problems — the roles this resume appears suited for versus the roles it is unlikely to win.

For every criticism, point to the specific resume section or wording that caused it and propose a concrete correction that remains truthful. Do not recommend adding keywords or metrics unless the underlying fact is already supported; label questions I should answer separately.

Return:
- a blunt 5-line recruiter verdict;
- a prioritized table: Severity | Problem | Evidence | Exact fix;
- the five highest-impact rewrites, shown as Before → After;
- missing facts I should supply, as short questions;
- the three best-fit role families for the resume as it stands.

Stop once the recommendations are specific enough for me to revise the resume; do not pad the response with generic resume advice.`,
          note: "Deep recruiter audit grounded in both your Devcard content and rendered resume",
        },
      },
    ],
  },
  {
    title: "Finding roles you're a strong match for",
    prompts: [
      {
        text: `Act as an expert technical recruiter. Pull my full profile with get_full_profile, then identify 10 specific job titles where I'm an 80%+ match with the highest realistic chance of landing an interview — target industry/location: [fill in]. For each, give me: Job Title | Estimated Match % | Why I'm a Strong Fit | Top 3 Missing Keywords to Add | Where to Search. Base every claim on what's actually in my profile — no inflating my fit to hit round numbers.`,
        note: "No job description needed — analyzes your whole profile",
        chatgpt: {
          text: `Find the 10 job titles that give me the best realistic chance of landing interviews in [target industry/location].

Use ChatGPT's built-in browser to open http://localhost:6366 and read my full Devcard Knowledge base in Markdown view. Then use current web and job-market evidence to validate that the titles are actually used and hiring in my target market. Base candidate-fit claims only on Devcard; cite or link the market evidence you use.

Rank titles by realistic interview probability, not prestige. Distinguish between:
- wording absent from my resume even though Devcard supports the underlying capability;
- a genuine skill or experience gap that I must not claim.

Return one ranked table:
Rank | Job title | Conservative fit % | Strongest evidence from Devcard | Main gap | Resume wording to surface | Where to search

Include only roles you estimate at 70%+; return fewer than 10 if fewer genuinely qualify. After the table, recommend the top three titles to pursue first and explain the decision in no more than five bullets. Do not edit Devcard, invent qualifications, or inflate percentages to satisfy the requested count.`,
          note: "Combines your live profile with current market evidence and conservative ranking",
        },
      },
    ],
  },
  {
    title: "Finding, prepping, and applying to fresh jobs",
    prompts: [
      {
        text: `Find, prepare, and apply to fresh job applications for me, step by step:
1. Call list_job_platforms and search those sites (register a new one with add_job_platform if I mention one that isn't there yet).
2. Search for fresh [job title(s)] openings posted in the last [N] days on each platform — navigate to each platform's own search directly (e.g. via Claude for Chrome) and use its filters by default; use an Apify job-search tool instead only if I'm not searching a specific portal or want a broader internet-wide crawl.
3. Check list_applications and skip any posting (same company + role, or same URL) I've already applied to. For the rest, pull the JD text and cross-check it against my Devcard profile (get_full_profile). Rank roles by a conservative estimated match and prioritize roles where my truthful profile can credibly reach 90+ after tailoring.
4. For each strong match, run tailor_resume and show estimatedMatchScore, scoreRationale, atsWarnings, and missingSkills. If tailor_resume fails or isn't available, do this analysis yourself directly instead of stopping — same rules either way, including the hard limits tailor_resume enforces in code that you have to self-enforce by hand: summary under 500 characters, at most 18 matched skills. Ask before including any missing skill, never inflate a score. Then save_resume_version named '<Company> - <Role>' and generate the polished PDF with get_resume_pdf.
5. Use the Claude in Chrome extension specifically for this step — the one in my real Chrome browser where I'm already logged into these sites, never a generic/sandboxed browsing tool that hits the login page and gives up. If it's connected: for each strong match, open the posting, fill in the application form from my profile, and submit it. If the form has a real file-upload field for the resume (not just pasted text), use the exact local file path get_resume_pdf gave you for that version — never a download link or a guessed path — to attach it. Pause and tell me if you hit a CAPTCHA or a login wall it genuinely can't get through, instead of guessing or claiming you submitted something you didn't. If it isn't connected, say so and skip this step — I'll apply myself from the saved PDFs.
6. For every application you actually submitted, call record_application to log it, linked to its resume version. Give me one final table: Job Title | Company | Estimated Match | Resume Version | Applied (yes/no) | PDF link. Never imply that a score guarantees an interview.`,
        note: "Searches each platform's own search directly by default; falls back to an Apify job-search tool for a broader internet-wide crawl when not confined to one portal; applies via the Claude in Chrome extension — your real, logged-in browser session, not a sandboxed browsing tool — if it's connected, otherwise hands you the tailored PDFs to apply yourself",
        chatgpt: {
          text: `Find, qualify, tailor, and apply to the strongest fresh [job title(s)] openings posted within the last [N] days.

Use ChatGPT's built-in browser for my local Devcard dashboard at http://localhost:6366. Use my connected Chrome profile for registered job portals and application forms. Devcard is the only source of truth about my background; live job pages are the source of truth for role requirements and application status.

Success means:
- every candidate is a live, recent posting with company, role, location, posting date, and URL verified;
- anything already recorded in Devcard with the same URL or company + role is skipped before tailoring;
- only strong, truthful matches move forward, and weak matches are rejected with a brief reason;
- each approved role gets its own Devcard resume version and polished PDF;
- an application is marked submitted only after the site visibly confirms it, then it is recorded in Devcard.

Work in stages:
1. Read my Devcard profile, registered platforms, and application history. Search the registered platforms and build a shortlist ranked by conservative fit.
2. Show me one decision table: Role | Company | Location | Posted | Fit | Evidence | Gaps | Recommendation | URL. Ask me to choose which roles to continue with; do not tailor or apply before this checkpoint.
3. For each approved role, run the full JD through Devcard's Tailor tab. Keep the summary under 500 characters and matched skills at 18 or fewer. Show missing skills and ask only about ones that materially affect fit. Never enable one without my confirmation. Save '<Company> - <Role>', generate the polished PDF, and verify the preview.
4. Prepare the application in connected Chrome using only verified Devcard facts and the exact role-specific PDF. Pause immediately before each final submission and whenever a CAPTCHA, login issue, ambiguous question, missing fact, consent, or sensitive field requires me. Never guess.
5. After visible submission confirmation, record the application in Devcard with the correct URL and resume version.

Final output:
Job Title | Company | Verified fit | Resume version | Applied (yes/no) | Evidence of submission | Blocker/next action

If a required browser or site is unavailable, complete every earlier stage that is still possible, state the precise blocker, and hand me the prepared PDF and URL.`,
          note: "Full ChatGPT Work workflow with shortlist and pre-submission checkpoints",
        },
      },
    ],
  },
  {
    title: "Daily job hunt — Naukri, Hirist, Wellfound",
    prompts: [
      {
        text: `Run today's job hunt: pull 10 fresh openings each from Naukri, Hirist, and Wellfound (register any that aren't already in list_job_platforms). Check list_applications first and skip any posting (same company + role, or same URL) I've already applied to — don't tailor or apply to it twice. Cross-check every remaining posting against my Devcard profile and only move forward on strong matches — skip weak ones rather than forcing all 30 through. For each strong match: tailor_resume (or do the analysis yourself if it's unavailable — same hard limits either way: summary under 500 characters, at most 18 matched skills), save_resume_version, and generate the PDF. Then actually apply via the Claude in Chrome extension — I've already given standing permission for these platforms, so don't ask me per job, just go; only pause if you hit a CAPTCHA or a login wall you genuinely can't get through. Log every submitted application with record_application, then give me the final table: Job Title | Company | Platform | Estimated Match | Applied (yes/no) | PDF link. Also tell me how many postings you skipped as already-applied.`,
        note: "A ready-to-fire, fixed-scope version of the prompt above — no brackets to fill in, run it as-is",
        chatgpt: {
          text: `Run today's focused job hunt across Naukri, Hirist, and Wellfound using my connected Chrome profile and my local Devcard dashboard at http://localhost:6366.

Goal: find up to 10 fresh postings per platform, then advance only the strongest truthful matches instead of forcing a quota.

Use Devcard as the only source of truth about my background. Read my profile and application history first. Verify each posting is live and capture its company, title, location, posting age, URL, and essential requirements. Skip duplicates already recorded by URL or company + role.

Screen all verified postings conservatively. Return fewer results when quality is low. Before tailoring anything, show the top shortlist in this format:
Rank | Role | Company | Platform | Posted | Fit | Strongest evidence | Critical gap | URL

Recommend which roles deserve an application and pause for my approval. For approved roles, use Devcard's Tailor tab with the full JD. Keep each summary under 500 characters and matched skills at 18 or fewer. Show missing skills separately and never include one without my confirmation. Save a '<Company> - <Role>' version, generate the polished PDF, and verify the preview.

Prepare each application in connected Chrome with only verified facts and the exact matching PDF. Pause before final submission and for any CAPTCHA, login issue, ambiguous question, missing fact, consent, or sensitive field. Count an application only when the site visibly confirms submission; then record it in Devcard.

Finish with:
- searched, invalid/stale, duplicate, weak-match, shortlisted, and submitted counts;
- Job Title | Company | Platform | Verified fit | Applied | Resume version | Blocker/next action.

If a site blocks access, continue with the others and report the exact blocker instead of fabricating results or stopping the whole run.`,
          note: "High-signal daily hunt optimized for quality, verification, and resumable execution",
        },
      },
    ],
  },
  {
    title: "Logging an application you just submitted",
    prompts: [
      {
        text: `I just applied to [Role] at [Company] on [platform/URL]. Log it with record_application, and link it to the '<Company> — <Role>' resume version if I saved one for it.`,
        note: "After you actually apply, via Claude for Chrome or by hand",
        chatgpt: {
          text: `Record this submitted application accurately in Devcard:

- Role: [Role]
- Company: [Company]
- Job URL/platform: [platform or URL]
- Application date: [date, or use today]
- Status: Applied
- Notes: [optional]

Use ChatGPT's built-in browser to open http://localhost:6366 and work in the Applications tab. Check for an existing record with the same URL or company + role before creating anything. Link the exact '<Company> - <Role>' resume version if one exists; if several versions could match, ask me which one. Ask only for a required field that cannot be determined from the information above.

After saving, verify the new row in the Applications table and return: Company | Role | Platform | Date | Status | Linked resume. Do not claim it was recorded unless the row is visible.`,
          note: "Duplicate-safe ChatGPT prompt that verifies the saved application row",
        },
      },
    ],
  },
];

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={handleCopy}>
      {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : label}
    </Button>
  );
}

function PromptRow({ prompt, client }: { prompt: Prompt; client: Client }) {
  const [copied, setCopied] = useState(false);
  const variant = client === "chatgpt" ? prompt.chatgpt : prompt;

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!variant) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3.5 py-2.5">
        <p className="text-sm text-muted-foreground">
          A ChatGPT version has not been added for this prompt yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">"{variant.text}"</p>
        {variant.note && <p className="mt-1 text-xs text-muted-foreground">{variant.note}</p>}
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        className="shrink-0"
        onClick={() => handleCopy(variant.text)}
        aria-label={`Copy: ${variant.text}`}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </Button>
    </div>
  );
}

type Client = "claude" | "chatgpt";

function ClientToggle({ client, onChange }: { client: Client; onChange: (c: Client) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5">
      {(["claude", "chatgpt"] as const).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors",
            client === c ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {c === "chatgpt" ? "ChatGPT" : "Claude"}
        </button>
      ))}
    </div>
  );
}

export function GuidePage() {
  const [client, setClient] = useState<Client>("claude");

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-3 flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Keep it always in sync
              </h2>
              <ClientToggle client={client} onChange={setClient} />
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {client === "claude" ? (
                <>
                  Paste this into Claude's custom instructions (claude.ai → Settings → Profile), Claude Desktop's
                  preferences, or a <code className="text-xs">CLAUDE.md</code> — anywhere it persists across
                  conversations. Once it's there, you never have to say "add this to Devcard" — just mention what
                  happened, the way you'd tell a colleague.
                </>
              ) : (
                <>
                  Paste this into ChatGPT's custom instructions (Settings → Personalization → Custom instructions),
                  or at the top of a new conversation. ChatGPT can't reach Devcard directly (see the note above), so
                  this is a different job from the Claude version — it keeps ChatGPT honest about what it can't do,
                  not wired up to save anything automatically.
                </>
              )}
            </p>
          </div>
          <CopyButton
            text={client === "claude" ? STANDING_INSTRUCTION : STANDING_INSTRUCTION_CHATGPT}
            label="Copy instruction"
          />
        </div>
        <Card>
          <CardContent>
            <pre className="font-sans text-[0.83rem] leading-relaxed whitespace-pre-wrap text-foreground/90">
              {formatForDisplay(client === "claude" ? STANDING_INSTRUCTION : STANDING_INSTRUCTION_CHATGPT)}
            </pre>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-1 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Prompt cheat sheet</h2>
          <ClientToggle client={client} onChange={setClient} />
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Copy-paste starting points, once the standing instruction above is in place (or even without it — these
          work as one-off requests too). Anything in <code className="text-xs">[brackets]</code> is a
          placeholder — replace it with your own details before sending; everything else is literal.
          {client === "chatgpt" && (
            <>
              {" "}
              ChatGPT versions use the built-in browser for your local Devcard dashboard and, when needed, your
              connected Chrome profile for logged-in job sites. Start Devcard first; connect Chrome before running
              the job-site prompts.
            </>
          )}
        </p>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {CHEAT_SHEET.map((category) => (
            <div key={category.title}>
              <h3 className="mb-2 text-sm font-semibold">{category.title}</h3>
              <div className="space-y-2">
                {category.prompts.map((prompt) => (
                  <PromptRow key={prompt.text} prompt={prompt} client={client} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
