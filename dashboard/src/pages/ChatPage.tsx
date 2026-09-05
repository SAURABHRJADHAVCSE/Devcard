import { useState } from "react";
import { CheckCircle2, Command, Send, Sparkles } from "lucide-react";
import { chatUpdate } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Entry {
  message: string;
  summary: string[];
}

export function ChatPage() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<Entry[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!message.trim() || pending) return;
    setPending(true);
    setError(null);
    try {
      const { summary } = await chatUpdate(message);
      setHistory((prev) => [{ message, summary }, ...prev]);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update knowledge base");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="overflow-visible border-primary/15 bg-gradient-to-b from-card to-primary/[0.025]">
        <CardHeader className="pb-1">
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles size={19} />
          </div>
          <CardTitle className="text-lg font-semibold tracking-tight">Update your knowledge base</CardTitle>
          <CardDescription>
            Describe what you learned or built, in plain language — it gets parsed into skills, projects, and
            experience automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={5}
            placeholder="I learned Rust today and shipped a CLI tool called rsync-fast…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            {error ? <span className="text-sm text-destructive">{error}</span> : <span />}
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:flex">
                <Command size={11} /> Enter to send
              </span>
              <Button onClick={handleSend} disabled={pending || !message.trim()} className="gap-2">
                <Send size={14} /> {pending ? "Updating…" : "Update Devcard"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">Recent updates</h2>
            <span className="text-xs text-muted-foreground">{history.length} this session</span>
          </div>
          {history.map((entry, i) => (
            <Card key={i} size="sm" className="shadow-none">
              <CardContent>
                <div className="text-sm font-medium text-foreground/80">“{entry.message}”</div>
                <div className="mt-2 space-y-1">
                  {entry.summary.length ? (
                    entry.summary.map((line, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" /> {line}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">Nothing mapped to a profile change.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
