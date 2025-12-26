// src/stores/useUserStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getMe } from "@/services";
import type { User } from "@/types";

type UserState = {
  user: User | null;
  token: string | null;

  setUser: (user: User, token?: string | null) => void;
  updateUser: (partial: Partial<User>) => void;
  fetchUser: () => Promise<void>;
  clearUser: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      // login hoặc set lại user từ BE
      setUser: (user, token = null) =>
        set((state) => ({
          user,
          token: token ?? state.token, // nếu không truyền token thì giữ token cũ
        })),

      // cập nhật 1 phần user (nếu API trả về partial hoặc tự merge)
      updateUser: (partial) => {
        const current = get().user;
        if (!current) {
          return;
        }
        set({ user: { ...current, ...partial } });
      },

      // đồng bộ user với BE
      fetchUser: async () => {
        try {
          const user = await getMe();
          set({ user });
        } catch (error) {
          console.error("[useUserStore] fetchUser error:", error);
          // tùy bạn: nếu 401 có thể clearUser() ở đây
        }
      },

      clearUser: () => set({ user: null, token: null }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    },
  ),
);
