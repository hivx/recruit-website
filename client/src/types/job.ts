// src/types/job.ts

/** Tag (danh mục / kỹ năng gắn với Job) */
export interface Tag {
  id: number;
  name: string;
}

/** Raw tag từ BE (mapTags trong toJobDTO) */
export interface JobTagRaw {
  job_id: string;
  tag_id: number;
  tag: Tag | null;
}

/** Tag trong FE (camelCase) */
export interface JobTag {
  jobId: string;
  tagId: number;
  tag: Tag | null;
}

/** Kỹ năng yêu cầu (raw từ BE) */
export interface JobRequiredSkillRaw {
  skill_id: number;
  skill_name: string | null;
  level_required: number | null;
  years_required: number | null;
  must_have: boolean;
}

/** Kỹ năng yêu cầu (FE) */
export interface JobRequiredSkill {
  skillId: number;
  skillName: string | null;
  levelRequired: number | null;
  yearsRequired: number | null;
  mustHave: boolean;
}

/** Trạng thái duyệt job (raw) */
export interface JobApprovalRaw {
  id: string;
  status: "pending" | "approved" | "rejected";
  reason: string | null;
  auditor_id: string | null;
  audited_at: string | null;
}

/** Trạng thái duyệt job (FE) */
export interface JobApproval {
  id: string;
  status: "pending" | "approved" | "rejected";
  reason: string | null;
  auditorId: string | null;
  auditedAt: string | null;
}

/** Item trong skill_profile vector */
export interface SkillProfileItem {
  id: number;
  must?: boolean;
  weight: number;
}

/** Item trong tag_profile vector */
export interface TagProfileItem {
  id: number;
  weight: number;
}

/** Vector raw từ BE */
export interface JobVectorRaw {
  skill_profile: SkillProfileItem[];
  tag_profile: TagProfileItem[];
  title_keywords: Record<string, number> | null;
  location: string | null;
  salary_avg: number | null;
}

/** Vector FE (camelCase) */
export interface JobVector {
  skillProfile: SkillProfileItem[];
  tagProfile: TagProfileItem[];
  titleKeywords: Record<string, number> | null;
  location: string | null;
  salaryAvg: number | null;
}

/** Job raw từ BE (theo toJobDTO) */
export interface JobRaw {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  requirements: string | null;
  created_by: string;
  company_id: string;

  company?: {
    id: string;
    legal_name: string;
  } | null;

  tags: JobTagRaw[];

  requiredSkills: JobRequiredSkillRaw[];

  approval: JobApprovalRaw | null;

  vector: JobVectorRaw | null;

  created_at: string;
  updated_at: string;

  // Các field bổ sung từ BE (nếu có)
  isFavorite?: boolean;
}

/** Job dùng trong FE (camelCase, sạch) */
export interface Job {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  requirements: string | null;

  createdBy: string;
  companyId: string;

  company?: {
    id: string;
    legalName: string;
  } | null;

  tags: JobTag[];
  requiredSkills: JobRequiredSkill[];
  approval: JobApproval | null;
  vector: JobVector | null;

  createdAt: string;
  updatedAt: string;
}

export interface JobDetail extends Job {
  // Optional: nếu BE có trả thêm
  isFavorite: boolean;
}
