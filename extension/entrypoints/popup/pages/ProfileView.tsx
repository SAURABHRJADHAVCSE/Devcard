import { useEffect, useState } from "react";
import { getProfile } from "@/lib/api";
import type { FullProfile } from "@/lib/types";

export function ProfileView() {
  const [full, setFull] = useState<FullProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfile()
      .then(setFull)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load profile"));
  }, []);

  if (error) {
    return (
      <div className="p-4 text-sm text-red-600">
        Couldn't reach the MCP server. Is it running on the URL set in Settings?
        <div className="mt-1 text-xs text-red-400">{error}</div>
      </div>
    );
  }

  if (!full) {
    return <div className="p-4 text-sm text-gray-400">Loading profile…</div>;
  }

  const { profile, skills, experiences, projects } = full;

  return (
    <div className="p-4 space-y-4 text-sm">
      <div>
        <div className="text-base font-semibold text-gray-900">{profile?.name || "Untitled profile"}</div>
        {profile?.headline && <div className="text-gray-500">{profile.headline}</div>}
      </div>

      {skills.length > 0 && (
        <div>
          <div className="mb-1 font-medium text-gray-700">Skills</div>
          <div className="flex flex-wrap gap-1">
            {skills.map((s) => (
              <span key={s.id} className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand-dark">
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {experiences.length > 0 && (
        <div>
          <div className="mb-1 font-medium text-gray-700">Experience</div>
          <ul className="space-y-1">
            {experiences.map((e) => (
              <li key={e.id} className="text-gray-600">
                <span className="font-medium text-gray-800">{e.role}</span> at {e.company}
              </li>
            ))}
          </ul>
        </div>
      )}

      {projects.length > 0 && (
        <div>
          <div className="mb-1 font-medium text-gray-700">Projects</div>
          <ul className="space-y-1">
            {projects.map((p) => (
              <li key={p.id} className="text-gray-600">
                {p.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {skills.length === 0 && experiences.length === 0 && projects.length === 0 && (
        <div className="text-gray-400">Nothing here yet — try the Chat tab to add something.</div>
      )}
    </div>
  );
}
