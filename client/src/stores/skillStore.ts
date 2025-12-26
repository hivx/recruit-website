// src/stores/skillStore.ts
import { create } from "zustand";
import type { UserSkill, SkillOption } from "@/types";

interface SkillStoreState {
  // Data
  mySkills: UserSkill[];
  allSkills: SkillOption[];

  // State
  loading: boolean;
  loaded: boolean;

  // Actions
  setMySkills: (skills: UserSkill[]) => void;
  setAllSkills: (skills: SkillOption[]) => void;

  addOrUpdateMySkill: (skill: UserSkill) => void;
  removeMySkill: (id: string) => void;

  reset: () => void;
}

export const useSkillStore = create<SkillStoreState>((set) => ({
  // =============================
  // STATE
  // =============================
  mySkills: [],
  allSkills: [],
  loading: false,
  loaded: false,

  // =============================
  // SETTERS
  // =============================
  setMySkills: (skills) =>
    set({
      mySkills: skills,
      loaded: true,
      loading: false,
    }),

  setAllSkills: (skills) =>
    set({
      allSkills: skills,
    }),

  // =============================
  // MUTATIONS (UI-level)
  // =============================
  addOrUpdateMySkill: (skill) =>
    set((state) => {
      const exists = state.mySkills.find((s) => s.id === skill.id);

      if (exists) {
        return {
          mySkills: state.mySkills.map((s) => (s.id === skill.id ? skill : s)),
        };
      }

      return {
        mySkills: [...state.mySkills, skill],
      };
    }),

  removeMySkill: (id) =>
    set((state) => ({
      mySkills: state.mySkills.filter((s) => s.id !== id),
    })),

  // =============================
  // RESET (logout, switch account)
  // =============================
  reset: () =>
    set({
      mySkills: [],
      allSkills: [],
      loading: false,
      loaded: false,
    }),
}));
