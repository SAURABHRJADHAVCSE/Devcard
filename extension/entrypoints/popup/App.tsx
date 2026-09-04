import { Brain, User, RefreshCw, Settings as SettingsIcon } from "lucide-react";
import { useUiStore, type Page } from "@/lib/store";
import { ProfileView } from "./pages/ProfileView";
import { ChatUpdate } from "./pages/ChatUpdate";
import { SyncStatus } from "./pages/SyncStatus";
import { Settings } from "./pages/Settings";

const TABS: { page: Page; label: string; icon: typeof User }[] = [
  { page: "profile", label: "Profile", icon: User },
  { page: "chat", label: "Chat", icon: Brain },
  { page: "sync", label: "Sync", icon: RefreshCw },
  { page: "settings", label: "Settings", icon: SettingsIcon },
];

const PAGES: Record<Page, React.ComponentType> = {
  profile: ProfileView,
  chat: ChatUpdate,
  sync: SyncStatus,
  settings: Settings,
};

function App() {
  const { page, setPage } = useUiStore();
  const ActivePage = PAGES[page];

  return (
    <div className="flex h-[500px] w-[360px] flex-col bg-white">
      <header className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
        <span className="text-lg">🧠</span>
        <span className="font-semibold text-gray-900">Devcard</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        <ActivePage />
      </div>

      <nav className="flex border-t border-gray-100">
        {TABS.map(({ page: p, label, icon: Icon }) => (
          <button
            key={p}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
              page === p ? "text-brand" : "text-gray-400"
            }`}
            onClick={() => setPage(p)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
