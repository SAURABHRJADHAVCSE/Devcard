import { useEffect, useState } from "react";
import { Download, ShieldCheck, ExternalLink } from "lucide-react";
import { getPdfTemplates, type PdfTemplateInfo } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function TemplateCard({ template }: { template: PdfTemplateInfo }) {
  const previewUrl = `/api/pdf?template=${template.id}&disposition=inline`;
  const downloadUrl = `/api/pdf?template=${template.id}`;

  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg hover:shadow-slate-950/5">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{template.name}</h3>
              {template.atsFriendly && (
                <Badge variant="secondary" className="gap-1">
                  <ShieldCheck size={11} className="text-emerald-600 dark:text-emerald-400" /> ATS-friendly
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/80 bg-muted/30 shadow-inner" style={{ aspectRatio: "1 / 1.35" }}>
          <iframe src={previewUrl} title={`${template.name} preview`} loading="lazy" className="h-full w-full" />
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border/70 pt-4">
          <Button size="sm" variant="outline" className="gap-1.5" render={<a href={previewUrl} target="_blank" rel="noreferrer" />}>
            <ExternalLink size={14} /> Open full size
          </Button>
          <Button size="sm" className="gap-1.5" render={<a href={downloadUrl} download />}>
            <Download size={14} /> Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResumesPage() {
  const [templates, setTemplates] = useState<PdfTemplateInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPdfTemplates()
      .then(setTemplates)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load templates"));
  }, []);

  if (error) return <div className="text-destructive">{error}</div>;
  if (templates.length === 0) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {templates.map((t) => (
        <TemplateCard key={t.id} template={t} />
      ))}
    </div>
  );
}
