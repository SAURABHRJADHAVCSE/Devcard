import { useEffect, useState } from "react";
import { Download, ShieldCheck } from "lucide-react";
import { getPdfTemplates, type PdfTemplateInfo } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function DownloadResume() {
  const [templates, setTemplates] = useState<PdfTemplateInfo[]>([]);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    getPdfTemplates()
      .then((list) => {
        setTemplates(list);
        setSelected((prev) => prev || list[0]?.id || "");
      })
      .catch(() => {
        // Non-fatal — the download button just won't render without templates.
      });
  }, []);

  if (templates.length === 0) return null;

  const active = templates.find((t) => t.id === selected);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
            {t.atsFriendly ? " (ATS-friendly)" : ""}
          </option>
        ))}
      </select>

      <Button size="sm" className="gap-1.5" render={<a href={`/api/pdf?template=${selected}`} download />}>
        <Download size={14} /> Download PDF
      </Button>

      {active && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {active.atsFriendly && <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" />}
          {active.description}
        </span>
      )}
    </div>
  );
}
