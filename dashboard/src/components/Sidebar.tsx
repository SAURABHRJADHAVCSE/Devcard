import { useState } from "react";
import {
  BookOpen,
  BrainCircuit,
  FileStack,
  Menu,
  MessageSquare,
  Moon,
  Send,
  Sparkles,
  Sun,
  User,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { useTheme } from "@/lib/theme";

export type Page = "profile" | "chat" | "resumes" | "tailor" | "applications" | "guide";

const NAV_GROUPS: { label: string; items: { page: Page; label: string; icon: LucideIcon }[] }[] = [
  {
    label: "Workspace",
    items: [
      { page: "profile", label: "Knowledge base", icon: User },
      { page: "chat", label: "Chat update", icon: MessageSquare },
    ],
  },
  {
    label: "Career",
    items: [
      { page: "resumes", label: "Resumes", icon: FileStack },
      { page: "tailor", label: "Tailor", icon: Sparkles },
      { page: "applications", label: "Applications", icon: Send },
    ],
  },
  {
    label: "Help",
    items: [{ page: "guide", label: "Guide", icon: BookOpen }],
  },
];

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
        <BrainCircuit size={19} strokeWidth={2.2} />
      </span>
      <div>
        <div className="text-[15px] font-bold tracking-[-0.02em]">Devcard</div>
        <div className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Career workspace</div>
      </div>
    </div>
  );
}

export function Sidebar({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }) {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  function navigate(nextPage: Page) {
    onNavigate(nextPage);
    setOpen(false);
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border/80 bg-background/90 px-4 backdrop-blur-xl md:hidden">
        <Brand />
        <Button variant="outline" size="icon" onClick={() => setOpen(true)} aria-label="Open navigation">
          <Menu size={18} />
        </Button>
      </header>

      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px] md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] shrink-0 flex-col border-r border-border/70 bg-card/95 shadow-2xl shadow-slate-950/10 backdrop-blur-xl transition-transform duration-200 ease-out md:sticky md:top-0 md:z-20 md:h-screen md:w-64 md:translate-x-0 md:shadow-none",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-20 items-center justify-between px-5">
          <Brand />
          <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={() => setOpen(false)} aria-label="Close navigation">
            <X size={17} />
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.14em] text-muted-foreground/75 uppercase">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map(({ page: itemPage, label, icon: Icon }) => {
                  const active = page === itemPage;
                  return (
                    <button
                      key={itemPage}
                      type="button"
                      onClick={() => navigate(itemPage)}
                      className={cn(
                        "group flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon size={17} strokeWidth={active ? 2.25 : 1.9} />
                      <span>{label}</span>
                      {active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="m-3 rounded-2xl border border-border/70 bg-muted/45 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgb(16_185_129/0.12)]" />
                Local server
              </div>
              <p className="mt-1 truncate pl-4 text-[11px] text-muted-foreground">Connected on :6366</p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
