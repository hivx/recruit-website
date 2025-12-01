import { create } from "zustand";
import type { GetTag, PopularTag } from "@/services";
import { getAllTags, getPopularTags } from "@/services";

interface TagStore {
  tags: GetTag[];
  popular: PopularTag[];
  selected: string[];

  fetchTags: () => Promise<void>;
  fetchPopular: () => Promise<void>;

  toggleTag: (name: string) => void;
  clearTags: () => void;
}

export const useTagStore = create<TagStore>((set, get) => ({
  tags: [],
  popular: [],
  selected: [],

  fetchTags: async () => {
    const data = await getAllTags();
    set({ tags: data as GetTag[] });
  },

  fetchPopular: async () => {
    const data = await getPopularTags();
    set({ popular: data });
  },

  toggleTag: (name: string) => {
    const { selected } = get();
    set({
      selected: selected.includes(name)
        ? selected.filter((t) => t !== name)
        : [...selected, name],
    });
  },

  clearTags: () => set({ selected: [] }),
}));
