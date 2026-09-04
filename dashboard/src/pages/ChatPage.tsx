import { useState } from "react";
import { Send } from "lucide-react";
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
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Update your knowledge base</CardTitle>
          <CardDescription>
            Describe what you learned or built, in plain language — it gets parsed into skills, projects, and
            experience automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={3}
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

          <div className="mt-3 flex items-center justify-between">
            {error ? <span className="text-sm text-destructive">{error}</span> : <span />}
            <Button onClick={handleSend} disabled={pending || !message.trim()} className="gap-2">
              <Send size={14} /> {pending ? "Thinking…" : "Send"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <div className="mt-6 space-y-3">
          {history.map((entry, i) => (
            <Card key={i}>
              <CardContent>
                <div className="text-sm text-foreground/70">"{entry.message}"</div>
                <div className="mt-2 space-y-1">
                  {entry.summary.length ? (
                    entry.summary.map((line, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <span className="text-emerald-600 dark:text-emerald-400">✓</span> {line}
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
