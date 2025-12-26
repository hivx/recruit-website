// src/stores/useJobFilterStore.ts
import { create } from "zustand";

type JobFilterState = {
  keyword: string;
  location: string | null;
  salaryRange: [number, number] | null;
  sort: "latest" | "salaryAsc" | "salaryDesc";

  setKeyword: (k: string) => void;
  setLocation: (l: string | null) => void;
  setSalaryRange: (r: [number, number] | null) => void;
  setSort: (s: JobFilterState["sort"]) => void;
};

export const useJobFilterStore = create<JobFilterState>((set) => ({
  keyword: "",
  location: null,
  salaryRange: null,
  sort: "latest",

  setKeyword: (keyword) => set({ keyword }),
  setLocation: (location) => set({ location }),
  setSalaryRange: (salaryRange) => set({ salaryRange }),
  setSort: (sort) => set({ sort }),
}));
