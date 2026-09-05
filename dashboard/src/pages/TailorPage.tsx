import { useEffect, useState } from "react";
import { Sparkles, Download, Trash2, ChevronRight, ShieldAlert } from "lucide-react";
import {
  tailorResume,
  listResumeVersions,
  saveResumeVersion,
  deleteResumeVersion,
} from "@/lib/api";
import type { ResumeVersion, TailorResult } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

function ToggleBadge({ label, included, onToggle }: { label: string; included: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}>
      <Badge
        variant={included ? "secondary" : "outline"}
        className={included ? "h-6 px-3 text-[0.8rem]" : "h-6 px-3 text-[0.8rem] text-muted-foreground"}
      >
        {label}
      </Badge>
    </button>
  );
}

function TailorForm({ onSaved }: { onSaved: (version: ResumeVersion) => void }) {
  const [name, setName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<TailorResult | null>(null);
  const [editedSummary, setEditedSummary] = useState("");
  const [includedMissing, setIncludedMissing] = useState<Set<string>>(new Set());
  const [includedProjects, setIncludedProjects] = useState<Set<string>>(new Set());

  async function handleAnalyze() {
    if (!jobDescription.trim()) return;
    setAnalyzing(true);
    setError(null);
    try {
      const r = await tailorResume(jobDescription, requiredSkills.trim() || undefined);
      setResult(r);
      setEditedSummary(r.summary);
      // Missing skills default OFF — a JD-required skill you don't actually
      // have shouldn't land on a resume without a deliberate opt-in.
      setIncludedMissing(new Set());
      // Suggested projects default ON — these are already real, matched
      // projects from your own profile, not a claim that needs approval.
      setIncludedProjects(new Set(r.suggestedProjects));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tailoring failed");
    } finally {
      setAnalyzing(false);
    }
  }

  function toggleMissing(skill: string) {
    setIncludedMissing((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  }

  function toggleProject(name: string) {
    setIncludedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function handleSave() {
    if (!result || !name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const version = await saveResumeVersion({
        name: name.trim(),
        jobDescription,
        summary: editedSummary,
        skillNames: [...result.matchedSkills, ...includedMissing],
        projectNames: [...includedProjects],
      });
      onSaved(version);
      setName("");
      setJobDescription("");
      setRequiredSkills("");
      setResult(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-primary/10 bg-gradient-to-b from-card to-primary/[0.02]">
      <CardContent className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Resume name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. "Google — Senior SWE, Jan 2026"'
            className="flex h-10 w-full rounded-xl border border-input bg-background/65 px-3 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:bg-card focus-visible:ring-3 focus-visible:ring-ring/20 dark:bg-input/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Job description</label>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
            placeholder="Paste the job description here"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Required skills <span className="font-normal text-muted-foreground">(optional — only if not obvious from the JD)</span>
          </label>
          <Textarea
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
            rows={2}
            placeholder="e.g. Terraform, Kubernetes, GraphQL"
          />
        </div>

        <Button onClick={handleAnalyze} disabled={analyzing || !jobDescription.trim()} className="gap-1.5">
          <Sparkles size={14} /> {analyzing ? "Analyzing…" : "Analyze"}
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && (
          <div className="space-y-4 border-t border-border pt-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tailored summary</label>
              <Textarea value={editedSummary} onChange={(e) => setEditedSummary(e.target.value)} rows={4} />
              <p className="mt-1 text-xs text-muted-foreground">
                Built only from what's already in your profile — edit freely, but keep it honest.
              </p>
            </div>

            {result.matchedSkills.length > 0 && (
              <div>
                <p className="mb-1.5 text-sm font-medium">Matched skills (already in your profile)</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedSkills.map((s) => (
                    <Badge key={s} variant="secondary" className="h-6 px-3 text-[0.8rem]">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.missingSkills.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                  <ShieldAlert size={14} className="text-amber-600 dark:text-amber-400" />
                  The JD wants these — not in your profile
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills.map((s) => (
                    <ToggleBadge key={s} label={s} included={includedMissing.has(s)} onToggle={() => toggleMissing(s)} />
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Off by default. Click to include on this resume only — it won't be added to your real profile. If
                  you actually have a skill here, add it for real from the Knowledge base tab or ask Claude instead.
                </p>
              </div>
            )}

            {result.suggestedProjects.length > 0 && (
              <div>
                <p className="mb-1.5 text-sm font-medium">Projects to feature</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.suggestedProjects.map((p) => (
                    <ToggleBadge key={p} label={p} included={includedProjects.has(p)} onToggle={() => toggleProject(p)} />
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleSave} disabled={saving || !name.trim()} className="gap-1.5">
              <ChevronRight size={14} /> {saving ? "Saving…" : "Save resume version"}
            </Button>
            {!name.trim() && <p className="text-xs text-muted-foreground">Give it a name above to save.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function VersionRow({ version, onDelete }: { version: ResumeVersion; onDelete: (id: string) => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <div className="font-semibold">{version.name}</div>
          <div className="text-xs text-muted-foreground">
            {version.template ?? "polished"}
            {version.updatedAt && ` · updated ${new Date(version.updatedAt).toLocaleDateString()}`}
          </div>
        </div>
        <div className="flex w-full shrink-0 gap-2 sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5 sm:flex-none"
            render={<a href={`/api/pdf?version=${version.id}`} download />}
          >
            <Download size={14} /> Download
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-muted-foreground hover:text-destructive"
            onClick={() => {
              if (window.confirm(`Delete "${version.name}"? This can't be undone.`)) onDelete(version.id);
            }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function TailorPage() {
  const [versions, setVersions] = useState<ResumeVersion[] | null>(null);

  useEffect(() => {
    listResumeVersions()
      .then(setVersions)
      .catch(() => setVersions([]));
  }, []);

  async function handleDelete(id: string) {
    await deleteResumeVersion(id);
    setVersions((prev) => (prev ? prev.filter((v) => v.id !== id) : prev));
  }

  return (
    <div className="space-y-8">
      <TailorForm onSaved={(v) => setVersions((prev) => [v, ...(prev ?? [])])} />

      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">Saved resume versions</h2>
        {versions === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : versions.length === 0 ? (
          <Card className="border-dashed py-10 text-center text-muted-foreground">
            <CardContent>Nothing saved yet — analyze a job description above to get started.</CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {versions.map((v) => (
              <VersionRow key={v.id} version={v} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
