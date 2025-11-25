// src/types/vector.ts

/** Hồ sơ hành vi (behavior profile) raw từ BE */
export interface BehaviorProfileRaw {
  user_id: string;
  keyword_profile: Record<string, number>;
  tag_profile: Record<string, number>;
  salary_preference: number | null;
  main_location: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/** Hồ sơ hành vi FE */
export interface BehaviorProfile {
  userId: string;
  keywordProfile: Record<string, number>;
  tagProfile: Record<string, number>;
  salaryPreference: number | null;
  mainLocation: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
