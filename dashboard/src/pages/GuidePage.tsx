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
remove_resume_version). Treat it as the standing source of truth for my skills, work
history, and projects.

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
- If I ask for my resume as a PDF, call get_resume_pdf directly. There's no separate PDF
  file to edit — it renders fresh from the profile every time, so if I want it to look
  different, edit the profile first (add_skill, update_experience, etc.) then call
  get_resume_pdf again.
- If I give you a job description, use tailor_resume, then show me its missingSkills before
  including any of them — never add a skill I haven't confirmed I actually have, and never
  add it to the real knowledge base even after I confirm, only to that resume version.`;

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
      { text: "I shipped a Chrome extension called Devcard, add it as a project" },
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
        <p className="text-sm leading-relaxed">"{prompt.text}"</p>
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
        <div className="mb-3 flex items-start justify-between gap-4">
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
          work as one-off requests too).
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
