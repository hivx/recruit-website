// src/stores/favoriteStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoriteStore {
  favorites: Set<number>;
  /** đồng bộ từ server (isFavorite === true) */
  setFromServer: (ids: number[]) => void;
  /** toggle local khi user bấm tim */
  toggle: (jobId: number) => void;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favorites: new Set<number>(),

      setFromServer: (ids) =>
        set(() => ({
          favorites: new Set(ids),
        })),

      toggle: (jobId) =>
        set(() => {
          const next = new Set(get().favorites);

          if (next.has(jobId)) {
            next.delete(jobId);
          } else {
            next.add(jobId);
          }

          return { favorites: next };
        }),
    }),
    {
      name: "favorite-jobs", // key trong localStorage

      /**
       * Set không serialize được → phải chuyển sang array
       */
      partialize: (state) => ({
        favorites: Array.from(state.favorites),
      }),

      /**
       * chuyển array → Set
       */
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.favorites = new Set(state.favorites as unknown as number[]);
        }
      },
    },
  ),
);
