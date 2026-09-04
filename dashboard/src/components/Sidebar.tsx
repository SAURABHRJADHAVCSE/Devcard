import { User, MessageSquare, RefreshCw, FileStack, BookOpen, Sun, Moon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "cn";
import { useTheme } from "@/lib/theme";

export type Page = "profile" | "chat" | "sync" | "resumes" | "guide";

const NAV: { page: Page; label: string; icon: LucideIcon }[] = [
  { page: "profile", label: "Knowledge base", icon: User },
  { page: "chat", label: "Chat update", icon: MessageSquare },
  { page: "sync", label: "Sync status", icon: RefreshCw },
  { page: "resumes", label: "Resumes", icon: FileStack },
  { page: "guide", label: "Guide", icon: BookOpen },
];

export function Sidebar({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }) {
  const { theme, toggle } = useTheme();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <span className="text-2xl">🧠</span>
        <span className="text-lg font-bold tracking-tight">Devcard</span>
      </div>

      <Separator />

      <nav className="flex flex-col gap-0.5 px-3 py-3">
        {NAV.map(({ page: p, label, icon: Icon }) => (
          <Button
            key={p}
            variant="ghost"
            onClick={() => onNavigate(p)}
            className={cn(
              "h-9 w-full justify-start gap-3 px-3 font-medium",
              page === p && "bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground",
            )}
          >
            <Icon size={16} strokeWidth={2.25} />
            {label}
          </Button>
        ))}
      </nav>

      <div className="mt-auto flex items-center justify-between gap-2 px-6 py-5">
        <span className="text-xs text-muted-foreground">
          Served from <span className="font-mono">:6366</span>
        </span>
        <Button variant="outline" size="icon-sm" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </Button>
      </div>
    </aside>
  );
}
