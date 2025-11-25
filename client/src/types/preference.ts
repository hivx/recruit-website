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

/** Recruiter required skill raw */
export interface RecruiterRequiredSkillRaw {
  skill_id: number;
  years_required: number | null;
  must_have: boolean;
}

/** Recruiter required skill FE */
export interface RecruiterRequiredSkill {
  skillId: number;
  yearsRequired: number | null;
  mustHave: boolean;
}

/** Recruiter preference raw */
export interface RecruiterPreferenceRaw {
  user_id: string;
  required_skills: RecruiterRequiredSkillRaw[];
  preferred_locations: string[];
  desired_salary_min: number | null;
  desired_salary_max: number | null;
}

/** Recruiter preference FE */
export interface RecruiterPreference {
  userId: string;
  requiredSkills: RecruiterRequiredSkill[];
  preferredLocations: string[];
  desiredSalaryMin: number | null;
  desiredSalaryMax: number | null;
}
