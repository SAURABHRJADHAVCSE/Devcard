import { useEffect, useState } from "react";
import { FileText, LayoutGrid, Mail, MapPin, Globe, Link, X } from "lucide-react";
import { getProfile, getResumeMarkdown, deleteSkill, deleteExperience, deleteProject, deleteEducation } from "@/lib/api";
import type { FullProfile } from "@/lib/types";
import { MarkdownView } from "@/components/MarkdownView";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  language: "Languages",
  framework: "Frameworks",
  tool: "Tools",
  cloud: "Cloud",
  soft: "Soft skills",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">{children}</h2>;
}

function TechBadges({ tech }: { tech: string[] }) {
  if (tech.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {tech.map((t) => (
        <Badge key={t} variant="outline" className="font-mono text-[0.7rem] font-normal">
          {t}
        </Badge>
      ))}
    </div>
  );
}

// Absolute-positioned, hidden until the containing `group` (the Card) is
// hovered — deletion is one click away but never visually competes with the
// content itself. `confirm()` is enough friction for personal local data;
// no need for a custom dialog.
function DeleteButton({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={`Remove ${label}`}
      onClick={() => {
        if (window.confirm(`Remove "${label}" from your knowledge base? This can't be undone.`)) onConfirm();
      }}
      className="absolute top-2 right-2 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
    >
      <X size={13} />
    </Button>
  );
}

function CardsView({ full, onChange }: { full: FullProfile; onChange: (full: FullProfile) => void }) {
  const { profile, skills, experiences, projects, education, certifications } = full;

  const byCategory = new Map<string, typeof skills>();
  for (const skill of skills) {
    const list = byCategory.get(skill.category) ?? [];
    list.push(skill);
    byCategory.set(skill.category, list);
  }

  const contact = [
    profile?.email && { icon: Mail, label: profile.email },
    profile?.location && { icon: MapPin, label: profile.location },
    profile?.website && { icon: Globe, label: profile.website },
    profile?.github && { icon: Link, label: profile.github },
    profile?.linkedin && { icon: Link, label: profile.linkedin },
  ].filter(Boolean) as { icon: typeof Mail; label: string }[];

  const isEmpty =
    !profile?.name && skills.length === 0 && experiences.length === 0 && projects.length === 0 && education.length === 0;

  if (isEmpty) {
    return (
      <Card className="border-dashed py-16 text-center text-muted-foreground">
        <CardContent>Nothing in the knowledge base yet — try the Chat update tab, or ask Claude to add something.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-10">
      <Card>
        <CardContent className="pt-2">
          <h1 className="text-3xl font-extrabold tracking-tight">{profile?.name || "Untitled profile"}</h1>
          {profile?.headline && <p className="mt-1 text-lg text-muted-foreground">{profile.headline}</p>}
          {profile?.bio && <p className="mt-4 max-w-2xl leading-relaxed text-foreground/80">{profile.bio}</p>}
          {contact.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {contact.map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <Icon size={14} /> {label}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {skills.length > 0 && (
        <section>
          <SectionTitle>Skills</SectionTitle>
          <div className="space-y-3">
            {[...byCategory.entries()].map(([category, list]) => (
              <div key={category} className="flex items-baseline gap-3">
                <span className="w-28 shrink-0 text-sm text-muted-foreground">{CATEGORY_LABELS[category] ?? category}</span>
                <div className="flex flex-wrap gap-2">
                  {list.map((s) => (
                    <Badge key={s.id} variant="secondary" className="group h-6 py-0 pr-1 pl-3 text-[0.8rem]">
                      {s.name}
                      <button
                        type="button"
                        aria-label={`Remove ${s.name}`}
                        onClick={() => {
                          if (window.confirm(`Remove "${s.name}" from your skills?`)) deleteSkill(s.id).then(onChange);
                        }}
                        className="ml-1 rounded-full p-0.5 opacity-0 transition-opacity hover:bg-destructive/20 hover:text-destructive group-hover:opacity-100"
                      >
                        <X size={10} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {experiences.length > 0 && (
        <section>
          <SectionTitle>Experience</SectionTitle>
          <div className="space-y-4">
            {experiences.map((e) => (
              <Card key={e.id} className="group relative">
                <CardContent>
                  <DeleteButton label={`${e.role} at ${e.company}`} onConfirm={() => deleteExperience(e.id).then(onChange)} />
                  <div className="flex items-baseline justify-between gap-4 pr-6">
                    <div>
                      <div className="font-semibold">{e.role}</div>
                      <div className="text-sm text-muted-foreground">{e.company}</div>
                    </div>
                    <div className="whitespace-nowrap text-sm text-muted-foreground">
                      {e.startDate} – {e.isCurrent ? "Present" : (e.endDate ?? "")}
                    </div>
                  </div>
                  {e.description && <p className="mt-3 text-sm leading-relaxed text-foreground/80">{e.description}</p>}
                  <TechBadges tech={parseJsonArray(e.techUsed)} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section>
          <SectionTitle>Projects</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {projects.map((p) => (
              <Card key={p.id} className="group relative">
                <CardContent>
                  <DeleteButton label={p.name} onConfirm={() => deleteProject(p.id).then(onChange)} />
                  <div className="pr-6 font-semibold">{p.name}</div>
                  {p.description && <p className="mt-2 text-sm leading-relaxed text-foreground/80">{p.description}</p>}
                  <TechBadges tech={parseJsonArray(p.tech)} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section>
          <SectionTitle>Education</SectionTitle>
          <div className="space-y-3">
            {education.map((ed) => (
              <Card key={ed.id} className="group relative">
                <CardContent>
                  <DeleteButton label={ed.institution} onConfirm={() => deleteEducation(ed.id).then(onChange)} />
                  <div className="pr-6 font-semibold">{[ed.degree, ed.field].filter(Boolean).join(" in ")}</div>
                  <div className="text-sm text-muted-foreground">
                    {ed.institution}
                    {(ed.startYear || ed.endYear) && ` · ${ed.startYear ?? ""} – ${ed.endYear ?? ""}`}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {certifications.length > 0 && (
        <section>
          <SectionTitle>Certifications</SectionTitle>
          <div className="space-y-2">
            {certifications.map((c) => (
              <div key={c.id} className="text-sm">
                <span className="font-medium">{c.name}</span>
                {c.issuer && <span className="text-muted-foreground"> — {c.issuer}</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function ProfilePage() {
  const [full, setFull] = useState<FullProfile | null>(null);
  const [markdown, setMarkdown] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getProfile(), getResumeMarkdown()])
      .then(([p, md]) => {
        setFull(p);
        setMarkdown(md);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load profile"));
  }, []);

  if (error) return <div className="text-destructive">{error}</div>;
  if (!full) return <div className="text-muted-foreground">Loading…</div>;

  // A card delete already returns the fresh profile (no need to re-fetch
  // that), but the Markdown tab's export is a separately-rendered string
  // that would otherwise go stale until a full page reload.
  function handleChange(updated: FullProfile) {
    setFull(updated);
    getResumeMarkdown().then(setMarkdown);
  }

  return (
    <Tabs defaultValue="cards">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <TabsList className="w-fit">
          <TabsTrigger value="cards" className="gap-1.5">
            <LayoutGrid size={14} /> Cards
          </TabsTrigger>
          <TabsTrigger value="markdown" className="gap-1.5">
            <FileText size={14} /> Markdown
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="cards">
        <CardsView full={full} onChange={handleChange} />
      </TabsContent>
      <TabsContent value="markdown">
        <MarkdownView markdown={markdown} />
      </TabsContent>
    </Tabs>
  );
}
