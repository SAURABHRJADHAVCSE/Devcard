import { useEffect, useState } from "react";
import { Plus, Trash2, Download } from "lucide-react";
import {
  listJobPlatforms,
  addJobPlatform,
  deleteJobPlatform,
  listApplications,
  recordApplication,
  updateApplication,
  deleteApplication,
  listResumeVersions,
} from "@/lib/api";
import type { JobPlatform, Application, ApplicationStatus, ResumeVersion } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

const inputClass =
  "flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

const STATUS_OPTIONS: ApplicationStatus[] = ["applied", "interviewing", "rejected", "offer"];

const STATUS_VARIANT: Record<ApplicationStatus, "secondary" | "outline" | "destructive" | "default"> = {
  applied: "outline",
  interviewing: "secondary",
  offer: "default",
  rejected: "destructive",
};

function PlatformManager({ platforms, onAdded, onRemoved }: { platforms: JobPlatform[]; onAdded: (p: JobPlatform) => void; onRemoved: (id: string) => void }) {
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!name.trim() || !baseUrl.trim()) return;
    setSaving(true);
    try {
      const platform = await addJobPlatform(name.trim(), baseUrl.trim());
      onAdded(platform);
      setName("");
      setBaseUrl("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-3">
        <p className="text-sm font-medium">Job platforms you use</p>
        <p className="text-xs text-muted-foreground">
          Tells Claude which sites to search without you repeating them, and auto-labels applications by URL.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {platforms.length === 0 && <span className="text-xs text-muted-foreground">None registered yet.</span>}
          {platforms.map((p) => (
            <Badge key={p.id} variant="outline" className="h-6 gap-1.5 px-2.5 text-[0.8rem]">
              {p.name}
              <span className="text-muted-foreground">{p.baseUrl}</span>
              <button
                type="button"
                onClick={() => {
                  onRemoved(p.id);
                  deleteJobPlatform(p.id);
                }}
                className="ml-0.5 text-muted-foreground hover:text-destructive"
                aria-label={`Remove ${p.name}`}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name, e.g. LinkedIn" className={inputClass} />
          <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="Base URL, e.g. linkedin.com" className={inputClass} />
          <Button size="sm" onClick={handleAdd} disabled={saving || !name.trim() || !baseUrl.trim()} className="shrink-0 gap-1.5">
            <Plus size={14} /> Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RecordApplicationForm({
  resumeVersions,
  onSaved,
}: {
  resumeVersions: ResumeVersion[];
  onSaved: (a: Application) => void;
}) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [resumeVersionId, setResumeVersionId] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!company.trim() || !role.trim()) return;
    setSaving(true);
    try {
      const application = await recordApplication({
        company: company.trim(),
        role: role.trim(),
        jobUrl: jobUrl.trim() || undefined,
        resumeVersionId: resumeVersionId || undefined,
        notes: notes.trim() || undefined,
      });
      onSaved(application);
      setCompany("");
      setRole("");
      setJobUrl("");
      setResumeVersionId("");
      setNotes("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-3">
        <p className="text-sm font-medium">Record an application</p>
        <div className="grid grid-cols-2 gap-2">
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className={inputClass} />
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" className={inputClass} />
        </div>
        <input value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="Job posting URL (optional — used to auto-detect platform)" className={inputClass} />
        <div className="flex gap-2">
          <select value={resumeVersionId} onChange={(e) => setResumeVersionId(e.target.value)} className={inputClass}>
            <option value="">No tailored resume used</option>
            {resumeVersions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" className={inputClass} />
        <Button size="sm" onClick={handleSave} disabled={saving || !company.trim() || !role.trim()} className="gap-1.5">
          <Plus size={14} /> {saving ? "Saving…" : "Record application"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function ApplicationsPage() {
  const [platforms, setPlatforms] = useState<JobPlatform[] | null>(null);
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [resumeVersions, setResumeVersions] = useState<ResumeVersion[]>([]);

  useEffect(() => {
    listJobPlatforms().then(setPlatforms).catch(() => setPlatforms([]));
    listApplications().then(setApplications).catch(() => setApplications([]));
    listResumeVersions().then(setResumeVersions).catch(() => setResumeVersions([]));
  }, []);

  async function handleStatusChange(id: string, status: ApplicationStatus) {
    setApplications((prev) => (prev ? prev.map((a) => (a.id === id ? { ...a, status } : a)) : prev));
    await updateApplication(id, { status });
  }

  async function handleDelete(id: string) {
    setApplications((prev) => (prev ? prev.filter((a) => a.id !== id) : prev));
    await deleteApplication(id);
  }

  const versionsById = new Map(resumeVersions.map((v) => [v.id, v]));

  return (
    <div className="space-y-8">
      {platforms && (
        <PlatformManager
          platforms={platforms}
          onAdded={(p) => setPlatforms((prev) => [...(prev ?? []), p])}
          onRemoved={(id) => setPlatforms((prev) => (prev ? prev.filter((p) => p.id !== id) : prev))}
        />
      )}

      <RecordApplicationForm resumeVersions={resumeVersions} onSaved={(a) => setApplications((prev) => [a, ...(prev ?? [])])} />

      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">Applications</h2>
        {applications === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : applications.length === 0 ? (
          <Card className="border-dashed py-10 text-center text-muted-foreground">
            <CardContent>
              Nothing recorded yet — record one above, or ask Claude to call record_application after you apply.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Resume</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((a) => {
                    const version = a.resumeVersionId ? versionsById.get(a.resumeVersionId) : undefined;
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">
                          {a.jobUrl ? (
                            <a href={a.jobUrl} target="_blank" rel="noreferrer" className="hover:underline">
                              {a.role}
                            </a>
                          ) : (
                            a.role
                          )}
                        </TableCell>
                        <TableCell>{a.company}</TableCell>
                        <TableCell>{a.platform ?? <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell>{a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : "—"}</TableCell>
                        <TableCell>
                          <select
                            value={a.status}
                            onChange={(e) => handleStatusChange(a.id, e.target.value as ApplicationStatus)}
                            className={`h-6 rounded-full border-0 bg-transparent px-1 text-[0.8rem] outline-none ${badgeVariants({ variant: STATUS_VARIANT[a.status] })}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          {version ? (
                            <Button size="icon-sm" variant="ghost" render={<a href={`/api/pdf?version=${version.id}`} download />} aria-label={`Download resume for ${version.name}`}>
                              <Download size={14} />
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button size="icon-sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(a.id)} aria-label="Delete">
                            <Trash2 size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
