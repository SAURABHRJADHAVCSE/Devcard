import { useState } from "react";
import { Sidebar, type Page } from "@/components/Sidebar";
import { ProfilePage } from "@/pages/ProfilePage";
import { ChatPage } from "@/pages/ChatPage";
import { ResumesPage } from "@/pages/ResumesPage";
import { TailorPage } from "@/pages/TailorPage";
import { ApplicationsPage } from "@/pages/ApplicationsPage";
import { GuidePage } from "@/pages/GuidePage";

const PAGES: Record<Page, { title: string; subtitle: string; component: React.ComponentType }> = {
  profile: {
    title: "Knowledge base",
    subtitle: "Everything Devcard knows about you, from every source.",
    component: ProfilePage,
  },
  chat: {
    title: "Chat update",
    subtitle: "Tell Devcard what you learned or built — it figures out the rest.",
    component: ChatPage,
  },
  resumes: {
    title: "Resumes",
    subtitle: "Preview every resume template and download the one you want.",
    component: ResumesPage,
  },
  tailor: {
    title: "Tailor",
    subtitle: "Paste a job description, get an honest tailored resume version — saved and reusable.",
    component: TailorPage,
  },
  applications: {
    title: "Applications",
    subtitle: "Job platforms you use, and every application you've actually submitted.",
    component: ApplicationsPage,
  },
  guide: {
    title: "Guide",
    subtitle: "The standing instruction and prompt cheat sheet, ready to copy.",
    component: GuidePage,
  },
};

function App() {
  const [page, setPage] = useState<Page>("profile");
  const { title, subtitle, component: Active } = PAGES[page];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar page={page} onNavigate={setPage} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-10 py-10">
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </header>
          <Active />
        </div>
      </main>
    </div>
  );
}

export default App;
