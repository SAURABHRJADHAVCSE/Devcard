import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
- If you're not sure whether I actually applied to something, ask before calling
  record_application — never log an application on a guess.`;

interface Prompt {
  text: string;
  note?: string;
}

const CHEAT_SHEET: { title: string; prompts: Prompt[] }[] = [
  {
    title: "Adding a skill",
    prompts: [
      { text: "I learned Kubernetes this week, add it as an intermediate skill" },
      { text: "I've been writing Go for a few years now, add that" },
    ],
  },
  {
    title: "Adding a project",
    prompts: [
      { text: "I shipped a side project called Pulsecheck, an AI-powered uptime monitor, add it as a project" },
      { text: "Add my side project 'kalshi-bot' — a Python trading bot using the Kalshi API" },
    ],
  },
  {
    title: "Adding / updating experience",
    prompts: [
      { text: "I just started at Acme Corp as a Senior Backend Engineer" },
      { text: "I've been a freelance developer since January 2023, add that to my experience" },
    ],
  },
  {
    title: "Education / certifications",
    prompts: [
      { text: "Add my B.Tech in Computer Science from XYZ University, 2018 to 2022" },
      { text: "I passed the AWS Certified Cloud Practitioner exam in March 2025, expires March 2028" },
    ],
  },
  {
    title: "Updating your profile",
    prompts: [
      { text: "Update my headline to 'Full-stack engineer building AI products'" },
      { text: "Set my bio to: ..." },
    ],
  },
  {
    title: "Retrieving / searching",
    prompts: [
      { text: "What does my Devcard say about my React experience?" },
      { text: "Show me everything tagged with Docker" },
      { text: "Give me my full profile as JSON" },
    ],
  },
  {
    title: "Exporting",
    prompts: [
      { text: "Give me my resume as markdown" },
      { text: "Give me my resume as a PDF" },
      { text: "Format my Devcard profile as a two-paragraph bio for a LinkedIn summary" },
    ],
  },
  {
    title: "Tailoring a resume to a job",
    prompts: [
      {
        text: `Here's a job description:

[paste the JD]

Tailor my Devcard resume to this exact role. Use tailor_resume to analyze it against my real profile, then show me the tailored summary and matched skills. If it flags any required skills I don't have listed, ask me before including any of them on the resume — never assume I have something I haven't told you about. Once I confirm, save it with save_resume_version using a clear name like '<Company> — <Role>', then hand me the PDF with get_resume_pdf. Optimize for a high ATS match score against this JD, keep every claim 100% truthful and grounded in my actual profile, and make the summary and skill ordering as compelling and relevant to this role as the real facts allow — the strongest honest version of my resume for this job, not a generic one.`,
        note: "Works the same from Claude Code, Claude Desktop, or any other MCP-connected tool",
      },
    ],
  },
  {
    title: "Getting an honest resume audit",
    prompts: [
      {
        text: `Act as an expert recruiter reviewing my resume. Pull my full profile with get_full_profile (or get_resume_text), then tell me honestly: why might a recruiter reject this? Which important skills or achievements are underrepresented or missing entirely? Which parts should be emphasized more, and which are weak filler that should be cut? Be specific and critical — I'd rather hear it now than after 50 rejections.`,
        note: "No job description needed — a general quality critique",
      },
    ],
  },
  {
    title: "Finding roles you're a strong match for",
    prompts: [
      {
        text: `Act as an expert technical recruiter. Pull my full profile with get_full_profile, then identify 10 specific job titles where I'm an 80%+ match with the highest realistic chance of landing an interview — target industry/location: [fill in]. For each, give me: Job Title | Estimated Match % | Why I'm a Strong Fit | Top 3 Missing Keywords to Add | Where to Search. Base every claim on what's actually in my profile — no inflating my fit to hit round numbers.`,
        note: "No job description needed — analyzes your whole profile",
      },
    ],
  },
  {
    title: "Finding and prepping fresh jobs with Apify",
    prompts: [
      {
        text: `Find and prepare fresh job applications for me, step by step:
1. Call list_job_platforms and search those sites (register a new one with add_job_platform if I mention one that isn't there yet).
2. Search for fresh [job title(s)] openings posted in the last [N] days, using the Apify job tool.
3. For each posting, pull its JD text and cross-check it against my Devcard profile (get_full_profile) — rank them by how strong a match I am.
4. For anything that's a strong match: run tailor_resume against that JD (if it flags a required skill I don't have, ask me before including it — never assume I have something I haven't told you about), then save_resume_version named '<Company> — <Role>' and generate the PDF with get_resume_pdf.
5. Give me one final table: Job Title | Company | Match % | Why | Resume Version Saved | PDF link.
I'll handle the actual submitting myself, or via Claude for Chrome — your job stops at 'resume ready.'`,
        note: "Needs an Apify job-search tool connected in this session — ends at \"resume ready,\" doesn't submit anything itself",
      },
    ],
  },
  {
    title: "Logging an application you just submitted",
    prompts: [
      {
        text: `I just applied to [Role] at [Company] on [platform/URL]. Log it with record_application, and link it to the '<Company> — <Role>' resume version if I saved one for it.`,
        note: "After you actually apply, via Claude for Chrome or by hand",
      },
    ],
  },
  {
    title: "Cleanup",
    prompts: [
      { text: "Remove jQuery from my skills, I don't use it anymore" },
      { text: "I left Acme Corp last month — what should we update?", note: "Asks first, per the standing rule above" },
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

function PromptRow({ prompt }: { prompt: Prompt }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(prompt.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">"{prompt.text}"</p>
        {prompt.note && <p className="mt-1 text-xs text-muted-foreground">{prompt.note}</p>}
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        className="shrink-0"
        onClick={handleCopy}
        aria-label={`Copy: ${prompt.text}`}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </Button>
    </div>
  );
}

export function GuidePage() {
  return (
    <div className="space-y-10">
      <section>
        <div className="mb-3 flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Keep it always in sync
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Paste this into Claude's custom instructions (claude.ai → Settings → Profile), Claude Desktop's
              preferences, or a <code className="text-xs">CLAUDE.md</code> — anywhere it persists across
              conversations. Once it's there, you never have to say "add this to Devcard" — just mention what
              happened, the way you'd tell a colleague.
            </p>
          </div>
          <CopyButton text={STANDING_INSTRUCTION} label="Copy instruction" />
        </div>
        <Card>
          <CardContent>
            <pre className="font-sans text-[0.83rem] leading-relaxed whitespace-pre-wrap text-foreground/90">
              {STANDING_INSTRUCTION}
            </pre>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-1 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Prompt cheat sheet
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Copy-paste starting points, once the standing instruction above is in place (or even without it — these
          work as one-off requests too). Anything in <code className="text-xs">[brackets]</code> is a
          placeholder — replace it with your own details before sending; everything else is literal.
        </p>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {CHEAT_SHEET.map((category) => (
            <div key={category.title}>
              <h3 className="mb-2 text-sm font-semibold">{category.title}</h3>
              <div className="space-y-2">
                {category.prompts.map((prompt) => (
                  <PromptRow key={prompt.text} prompt={prompt} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
