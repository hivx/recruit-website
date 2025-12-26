// src/types/preference.ts
/** Career preference (ứng viên) raw từ BE */
export interface CareerPreferenceRaw {
  user_id: string;
  desired_title: string | null;
  desired_company: string | null;
  desired_location: string | null;
  desired_salary: number | null;
  tags: PreferenceTagRaw[];
  updated_at: string;
  created_at: string;
}

/** Career preference FE */
export interface CareerPreference {
  userId: string;
  desiredTitle: string;
  desiredCompany: string;
  desiredLocation: string;
  desiredSalary: number | null;
  tags: PreferenceTag[];
  updatedAt: string;
  createdAt: string;
}

/** Payload raw FE → BE (snake_case) */
export interface CareerPreferenceUpsertRaw {
  desired_title?: string | null;
  desired_company?: string | null;
  desired_location?: string | null;
  desired_salary?: number | null;
  tags?: string[];
}

/** Payload FE (camelCase) */
export interface CareerPreferenceUpsert {
  desiredTitle?: string;
  desiredCompany?: string;
  desiredLocation?: string;
  desiredSalary?: number | null;
  tags?: string[];
}

/** Recruiter desired tag raw (BE → FE) */
export interface PreferenceTagRaw {
  id: number;
  name: string;
}

/** Recruiter required skill raw (BE → FE) */
export interface RecruiterRequiredSkillRaw {
  id: number;
  name: string;
  years_required: number | null;
  must_have: boolean;
}

/** Recruiter preference raw (BE → FE) */
export interface RecruiterPreferenceRaw {
  user_id: string;
  desired_location: string | null;
  desired_salary_avg: number | null;
  desired_tags: PreferenceTagRaw[];
  required_skills: RecruiterRequiredSkillRaw[];
  updated_at: string;
}

/** Recruiter desired tag FE */
export interface PreferenceTag {
  id: number;
  name: string;
}

/** Recruiter required skill FE */
export interface RecruiterRequiredSkill {
  id: number;
  name: string;
  yearsRequired: number | null;
  mustHave: boolean;
}

/** Recruiter preference FE */
export interface RecruiterPreference {
  userId: string;
  desiredLocation: string | null;
  desiredSalaryAvg: number | null;
  desiredTags: PreferenceTag[];
  requiredSkills: RecruiterRequiredSkill[];
  updatedAt: string;
}

export interface RecruiterPreferenceUpsertRequest {
  desired_location?: string | null;
  desired_salary_avg?: number | null;
  desired_tags?: string[]; // tên tag
  required_skills?: {
    name: string;
    years_required?: number | null;
    must_have?: boolean;
  }[];
}
