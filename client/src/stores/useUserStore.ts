// src/stores/useUserStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

type UserState = {
  user: User | null;
  token: string | null;

  setUser: (user: User, token: string) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      setUser: (user, token) => set({ user, token }),

      clearUser: () => set({ user: null, token: null }),
    }),
    {
      name: "user-storage",
    },
  ),
);
