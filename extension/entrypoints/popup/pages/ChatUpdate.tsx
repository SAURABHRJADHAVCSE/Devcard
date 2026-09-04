import { useState } from "react";
import { chatUpdate } from "@/lib/api";

export function ChatUpdate() {
  const [message, setMessage] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!message.trim() || pending) return;
    setPending(true);
    setError(null);
    try {
      const { summary } = await chatUpdate(message);
      setRecent((prev) => [...(summary.length ? summary : ["Nothing changed"]), ...prev].slice(0, 8));
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update knowledge base");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex h-full flex-col p-4 text-sm">
      <div className="mb-2 font-medium text-gray-700">Update knowledge base</div>

      {recent.length > 0 && (
        <div className="mb-3 space-y-0.5 text-xs text-gray-500">
          {recent.map((line, i) => (
            <div key={i}>✓ {line}</div>
          ))}
        </div>
      )}

      <textarea
        className="w-full resize-none rounded-md border border-gray-300 p-2 text-sm focus:border-brand focus:outline-none"
        rows={3}
        placeholder="Tell me what you learned or built…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />

      <button
        className="mt-2 rounded-md bg-brand px-3 py-1.5 text-white disabled:opacity-50"
        onClick={handleSend}
        disabled={pending || !message.trim()}
      >
        {pending ? "AI is parsing…" : "Send"}
      </button>

      {error && <div className="mt-2 text-xs text-red-500">{error}</div>}
    </div>
  );
}
