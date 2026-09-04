import { useEffect, useState } from "react";
import { FileText, LayoutGrid, Mail, MapPin, Globe, Link } from "lucide-react";
import { getProfile, getResumeMarkdown } from "@/lib/api";
import type { FullProfile } from "@/lib/types";
import { MarkdownView } from "@/components/MarkdownView";
import { DownloadResume } from "@/components/DownloadResume";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

function CardsView({ full }: { full: FullProfile }) {
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
                    <Badge key={s.id} variant="secondary" className="h-6 px-3 text-[0.8rem]">
                      {s.name}
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
              <Card key={e.id}>
                <CardContent>
                  <div className="flex items-baseline justify-between gap-4">
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
              <Card key={p.id}>
                <CardContent>
                  <div className="font-semibold">{p.name}</div>
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
              <Card key={ed.id}>
                <CardContent>
                  <div className="font-semibold">{[ed.degree, ed.field].filter(Boolean).join(" in ")}</div>
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
        <DownloadResume />
      </div>

      <TabsContent value="cards">
        <CardsView full={full} />
      </TabsContent>
      <TabsContent value="markdown">
        <MarkdownView markdown={markdown} />
      </TabsContent>
    </Tabs>
  );
}
