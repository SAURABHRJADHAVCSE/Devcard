import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import { Check, Copy, Eye, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// The markdown rendered here is always server-generated from the user's own
// profile data (mcp-server's formatResumeMarkdown) — never third-party or
// user-uploaded content — so rendering it as HTML carries no real XSS risk
// in this single-user local tool.
export function MarkdownView({ markdown }: { markdown: string }) {
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [draft, setDraft] = useState(markdown);
  const [copied, setCopied] = useState(false);

  // Reset the draft whenever a fresh fetch lands (e.g. after a chat update
  // changes the underlying profile) — edits here are local/for copying only,
  // never written back to the knowledge base, so there's nothing to lose.
  useEffect(() => setDraft(markdown), [markdown]);

  const html = useMemo(() => marked.parse(draft, { async: false }), [draft]);

  async function handleCopy() {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex gap-1">
          <Button
            variant={mode === "preview" ? "secondary" : "ghost"}
            size="sm"
            className="gap-1.5"
            onClick={() => setMode("preview")}
          >
            <Eye size={14} /> Preview
          </Button>
          <Button variant={mode === "edit" ? "secondary" : "ghost"} size="sm" className="gap-1.5" onClick={() => setMode("edit")}>
            <Pencil size={14} /> Edit
          </Button>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <CardContent>
        {mode === "edit" ? (
          <>
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={20}
              className="font-mono text-[0.8rem] leading-relaxed"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Editing here only changes what you copy out — it doesn't update your stored knowledge base. Use the
              Chat update tab for that.
            </p>
          </>
        ) : (
          <div className="prose-devcard max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
        )}
      </CardContent>
    </Card>
  );
}
