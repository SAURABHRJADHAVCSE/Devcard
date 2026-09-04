import { create } from "zustand";

export type Page = "profile" | "chat" | "sync" | "settings";

interface UiState {
  page: Page;
  setPage: (page: Page) => void;
}

// UI state only — profile data always comes from the MCP server (Rule 1),
// never cached here as a source of truth.
export const useUiStore = create<UiState>((set) => ({
  page: "profile",
  setPage: (page) => set({ page }),
}));
