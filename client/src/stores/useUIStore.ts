import { create } from "zustand";

type UIState = {
  sidebarOpen: boolean;
  modalOpen: boolean;
  darkMode: boolean;

  toggleSidebar: () => void;
  openModal: () => void;
  closeModal: () => void;
  toggleDark: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  modalOpen: false,
  darkMode: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openModal: () => set({ modalOpen: true }),
  closeModal: () => set({ modalOpen: false }),
  toggleDark: () => set((s) => ({ darkMode: !s.darkMode })),
}));
