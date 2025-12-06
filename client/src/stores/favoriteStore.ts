// src/stores/favoriteStore.ts
import { create } from "zustand";

interface FavoriteStore {
  favorites: Set<number>;
  /** đồng bộ từ server (isFavorite === true) */
  setFromServer: (ids: number[]) => void;
  /** toggle local khi user bấm tim */
  toggle: (jobId: number) => void;
}

export const useFavoriteStore = create<FavoriteStore>((set) => ({
  favorites: new Set(),

  setFromServer: (ids) =>
    set(() => ({
      favorites: new Set(ids),
    })),

  toggle: (jobId) =>
    set((state) => {
      const next = new Set(state.favorites);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return { favorites: next };
    }),
}));
