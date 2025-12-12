// src/types/preference.ts
/** Career preference (ứng viên) raw từ BE */
export interface CareerPreferenceRaw {
  user_id: string;
  desired_roles: string[];
  desired_locations: string[];
  desired_salary: number | null;
  expected_company_size: string | null;
}

/** Career preference FE */
export interface CareerPreference {
  userId: string;
  desiredRoles: string[];
  desiredLocations: string[];
  desiredSalary: number | null;
  expectedCompanySize: string | null;
}

/** Recruiter desired tag raw (BE → FE) */
export interface RecruiterTagRaw {
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
  desired_tags: RecruiterTagRaw[];
  required_skills: RecruiterRequiredSkillRaw[];
  updated_at: string;
}

/** Recruiter desired tag FE */
export interface RecruiterTag {
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
  desiredTags: RecruiterTag[];
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
