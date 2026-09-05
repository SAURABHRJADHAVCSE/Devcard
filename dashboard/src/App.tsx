import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
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
    <div className="min-h-screen bg-background md:flex">
      <Sidebar page={page} onNavigate={setPage} />
      <main className="min-w-0 flex-1 pt-16 md:pt-0">
        <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-11">
          <header className="mb-7 flex items-end justify-between gap-6 border-b border-border/70 pb-6 sm:mb-9 sm:pb-7">
            <div className="min-w-0">
              <p className="mb-2 text-[10px] font-bold tracking-[0.15em] text-primary uppercase">Your workspace</p>
              <h1 className="text-2xl font-bold tracking-[-0.035em] text-balance sm:text-[1.75rem]">{title}</h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
            </div>
            <div className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-xs sm:flex">
              Private & local <ArrowUpRight size={12} className="text-emerald-500" />
            </div>
          </header>
          <Active />
        </div>
      </main>
    </div>
  );
}

export default App;
