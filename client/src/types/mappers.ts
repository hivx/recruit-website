// src/types/mappers.ts
import type { Application, ApplicationRaw } from "@/types/application";

import type {
  Company,
  CompanyRaw,
  CompanyVerification,
  CompanyVerificationRaw,
  CompanyListResponse,
  CompanyListResponseRaw,
  VerifyCompanyResponseRaw,
  VerifyCompanyResponse,
} from "@/types/company";
import type {
  Job,
  JobRaw,
  JobTag,
  JobRequiredSkill,
  JobApproval,
  JobVector,
  JobTagRaw,
  JobRequiredSkillRaw,
  JobApprovalRaw,
  JobVectorRaw,
  JobDetail,
  JobCreatePayloadRaw,
  JobCreatePayload,
  ApproveJobResponseRaw,
  ApproveJobResponse,
  RejectJobResponseRaw,
  RejectJobResponse,
} from "@/types/job";

import type {
  CareerPreference,
  CareerPreferenceRaw,
  RecruiterPreference,
  RecruiterPreferenceRaw,
  RecruiterRequiredSkill,
  RecruiterRequiredSkillRaw,
  PreferenceTag,
  PreferenceTagRaw,
  CareerPreferenceUpsert,
  CareerPreferenceUpsertRaw,
} from "@/types/preference";
import type {
  JobRecommendation,
  JobRecommendationRaw,
  CandidateRecommendation,
  CandidateRecommendationRaw,
} from "@/types/recommendation";
import type {
  User,
  UserRaw,
  UserSkillRaw,
  UserSkill,
  MySkillListResponseRaw,
  MySkillListResponse,
  SkillOptionRaw,
  SkillOption,
  AllSkillListResponseRaw,
  AllSkillListResponse,
  AdminUserListResponseRaw,
  AdminUserListResponse,
} from "@/types/user";

import type { BehaviorProfile, BehaviorProfileRaw } from "@/types/vector";

/* ---------------------------------------------------
 * Helper nhỏ: map an toàn mảng
 * --------------------------------------------------- */
function mapArray<T, R>(
  arr: T[] | undefined | null,
  mapper: (item: T) => R,
): R[] {
  return Array.isArray(arr) ? arr.map(mapper) : [];
}

/* ---------------------------------------------------
 * JOB MAPPERS
 * --------------------------------------------------- */

function mapJobTagRaw(raw: JobTagRaw): JobTag {
  return {
    jobId: raw.job_id,
    tagId: raw.tag_id,
    tag: raw.tag ?? null,
  };
}

function mapJobRequiredSkillRaw(raw: JobRequiredSkillRaw): JobRequiredSkill {
  return {
    skillId: raw.skill_id,
    name: raw.name,
    levelRequired: raw.level_required,
    yearsRequired: raw.years_required,
    mustHave: raw.must_have,
  };
}

function mapJobApprovalRaw(raw: JobApprovalRaw | null): JobApproval | null {
  if (!raw) {
    return null;
  }
  return {
    id: raw.id,
    status: raw.status,
    reason: raw.reason,
    auditorId: raw.auditor_id,
    auditedAt: raw.audited_at,
  };
}

function mapJobVectorRaw(raw: JobVectorRaw | null): JobVector | null {
  if (!raw) {
    return null;
  }

  return {
    skillProfile: raw.skill_profile ?? [],
    tagProfile: raw.tag_profile ?? [],
    titleKeywords: raw.title_keywords ?? null,
    location: raw.location ?? null,
    salaryAvg: raw.salary_avg ?? null,
  };
}

export function mapJobRaw(raw: JobRaw): Job {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    location: raw.location,

    salaryMin: raw.salary_min,
    salaryMax: raw.salary_max,

    requirements: raw.requirements,
    createdBy: raw.created_by,
    createdByName: raw.created_by_name,
    companyId: raw.company_id,

    company: raw.company
      ? {
          id: raw.company.id,
          legalName: raw.company.legal_name,
          logo: raw.company.logo ?? null,
        }
      : null,

    tags: mapArray(raw.tags, mapJobTagRaw),
    requiredSkills: mapArray(raw.requiredSkills, mapJobRequiredSkillRaw),

    approval: mapJobApprovalRaw(raw.approval),
    vector: mapJobVectorRaw(raw.vector),

    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    isFavorite: raw.isFavorite,
  };
}

export function mapJobDetailRaw(raw: JobRaw): JobDetail {
  return {
    ...mapJobRaw(raw),
    // nếu BE có trả thêm
    isFavorite: raw.isFavorite ?? false,
  };
}

/* ---------------------------------------------------
 * APPLICATION MAPPERS
 * --------------------------------------------------- */

export function mapApplicationRaw(raw: ApplicationRaw): Application {
  return {
    id: raw.id,
    jobId: raw.job_id,
    applicantId: raw.applicant_id,
    coverLetter: raw.cover_letter,
    cv: raw.cv,
    phone: raw.phone,
    status: raw.status,

    reviewedBy: raw.reviewed_by,
    reviewedAt: raw.reviewed_at,
    reviewNote: raw.review_note,

    fitScore: raw.fit_score,
    fitReason: raw.fit_reason,

    createdAt: raw.created_at,
    updatedAt: raw.updated_at,

    job: raw.job
      ? {
          id: raw.job.id,
          title: raw.job.title,
        }
      : undefined,

    applicant: raw.applicant
      ? {
          id: raw.applicant.id,
          name: raw.applicant.name,
          email: raw.applicant.email,
          avatar: raw.applicant.avatar,
        }
      : undefined,
  };
}

/* ---------------------------------------------------
 * USER MAPPERS
 * --------------------------------------------------- */

export function mapUserRaw(raw: UserRaw): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    avatar: raw.avatar,
    role: raw.role,
    isVerified: raw.isVerified,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    receiveRecommendation: raw.receive_recommendation,
    company: raw.company
      ? {
          id: raw.company.id,
          legalName: raw.company.legal_name,
          verificationStatus: raw.company.verificationStatus,
        }
      : null,
  };
}

/* ---------------------------------------------------
 * COMPANY MAPPERS
 * --------------------------------------------------- */

function mapCompanyVerificationRaw(
  raw: CompanyVerificationRaw | null,
): CompanyVerification | null {
  if (!raw) {
    return null;
  }
  return {
    status: raw.status,
    rejectionReason: raw.rejection_reason,
    submittedAt: raw.submitted_at,
    verifiedAt: raw.verified_at,
    reviewedBy: raw.reviewed_by,
  };
}

export function mapCompanyRaw(raw: CompanyRaw): Company {
  return {
    id: raw.id,
    legalName: raw.legal_name,
    registrationNumber: raw.registration_number,
    taxId: raw.tax_id,
    countryCode: raw.country_code,
    registeredAddress: raw.registered_address,
    incorporationDate: raw.incorporation_date,
    ownerId: raw.owner_id,
    logo: raw.logo ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    verification: mapCompanyVerificationRaw(raw.verification),
  };
}

/* ---------------------------------------------------
 * RECOMMENDATION MAPPERS
 * --------------------------------------------------- */
export function mapJobRecommendation(
  raw: JobRecommendationRaw,
): JobRecommendation {
  return {
    userId: raw.user_id,
    jobId: raw.job_id,
    fitScore: raw.fit_score,
    reason: raw.reason,
    status: raw.status,
    job: mapJobRaw(raw.job), // Dùng lại mapper job chuẩn
  };
}

export function mapCandidateRecommendation(
  raw: CandidateRecommendationRaw,
): CandidateRecommendation {
  return {
    id: raw.id,
    recruiterId: Number(raw.recruiter_id),
    applicantId: Number(raw.applicant_id),

    fitScore: raw.fit_score,
    reason: raw.reason,
    status: raw.status,

    recommendedAt: raw.recommended_at,
    updatedAt: raw.updated_at,

    isSent: raw.is_sent,
    sentAt: raw.sent_at,

    applicant: {
      id: Number(raw.applicant.id),
      name: raw.applicant.name,
      email: raw.applicant.email ?? null,
      avatar: raw.applicant.avatar ?? null,
      preferredLocation: raw.applicant.vector?.preferred_location ?? null,
    },

    recruiter: {
      id: Number(raw.recruiter.id),
      name: raw.recruiter.name,
      avatar: raw.recruiter.avatar ?? null,
    },
  };
}

/* ---------------------------------------------------
 * PREFERENCE MAPPERS
 * --------------------------------------------------- */

function mapPreferenceTagRaw(raw: PreferenceTagRaw): PreferenceTag {
  return {
    id: raw.id,
    name: raw.name,
  };
}

export function mapCareerPreferenceRaw(
  raw: CareerPreferenceRaw,
): CareerPreference {
  return {
    userId: raw.user_id,
    desiredTitle: raw.desired_title ?? "",
    desiredCompany: raw.desired_company ?? "",
    desiredLocation: raw.desired_location ?? "",
    desiredSalary: raw.desired_salary ?? null,
    tags: mapArray(raw.tags, mapPreferenceTagRaw),
    updatedAt: raw.updated_at,
    createdAt: raw.created_at,
  };
}

export function mapCareerPreferenceUpsert(
  payload: CareerPreferenceUpsert,
): CareerPreferenceUpsertRaw {
  const raw: CareerPreferenceUpsertRaw = {};

  if (payload.desiredTitle !== undefined) {
    raw.desired_title =
      payload.desiredTitle.trim() === "" ? null : payload.desiredTitle.trim();
  }

  if (payload.desiredCompany !== undefined) {
    raw.desired_company =
      payload.desiredCompany.trim() === ""
        ? null
        : payload.desiredCompany.trim();
  }

  if (payload.desiredLocation !== undefined) {
    raw.desired_location =
      payload.desiredLocation.trim() === ""
        ? null
        : payload.desiredLocation.trim();
  }

  if (payload.desiredSalary !== undefined) {
    raw.desired_salary = payload.desiredSalary;
  }

  if (payload.tags !== undefined) {
    raw.tags = payload.tags.map((t) => t.trim()).filter(Boolean);
  }

  return raw;
}

function mapRecruiterRequiredSkillRaw(
  raw: RecruiterRequiredSkillRaw,
): RecruiterRequiredSkill {
  return {
    id: raw.id,
    name: raw.name,
    yearsRequired: raw.years_required,
    mustHave: raw.must_have,
  };
}

export function mapRecruiterPreferenceRaw(
  raw: RecruiterPreferenceRaw,
): RecruiterPreference {
  return {
    userId: raw.user_id,
    desiredLocation: raw.desired_location,
    desiredSalaryAvg: raw.desired_salary_avg,
    updatedAt: raw.updated_at,
    desiredTags: raw.desired_tags.map((t) => ({
      id: t.id,
      name: t.name,
    })),
    requiredSkills: mapArray(raw.required_skills, mapRecruiterRequiredSkillRaw),
  };
}

/* ---------------------------------------------------
 * BEHAVIOR PROFILE MAPPERS
 * --------------------------------------------------- */

export function mapBehaviorProfileRaw(
  raw: BehaviorProfileRaw,
): BehaviorProfile {
  return {
    userId: raw.user_id,
    keywordProfile: raw.keyword_profile ?? {},
    tagProfile: raw.tag_profile ?? {},
    salaryPreference: raw.salary_preference,
    mainLocation: raw.main_location,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// ==============================
// USER SKILL MAPPER
// ==============================
export function mapUserSkillRaw(raw: UserSkillRaw): UserSkill {
  return {
    id: String(raw.id),
    name: raw.name,
    level: raw.level,
    years: raw.years,
    note: raw.note ?? null,
  };
}

export function mapMySkillListRaw(
  raw: MySkillListResponseRaw,
): MySkillListResponse {
  return {
    total: raw.total,
    skills: raw.skills.map(mapUserSkillRaw),
  };
}

// ==============================
// ALL SKILL OPTIONS (MASTER LIST)
// ==============================
export function mapSkillOptionRaw(raw: SkillOptionRaw): SkillOption {
  return {
    id: String(raw.id),
    name: raw.name,
  };
}

export function mapAllSkillListRaw(
  raw: AllSkillListResponseRaw,
): AllSkillListResponse {
  return raw.map(mapSkillOptionRaw);
}

// ==============================
// JOB CREATE PAYLOAD MAPPERS
// ==============================
export function mapJobCreatePayloadRaw(
  payload: JobCreatePayload,
): JobCreatePayloadRaw {
  return {
    title: payload.title,
    location: payload.location ?? null,
    description: payload.description ?? null,

    salary_min: payload.salaryMin ?? null,
    salary_max: payload.salaryMax ?? null,

    requirements: payload.requirements ?? null,

    tags: payload.tags,

    requiredSkills: payload.requiredSkills?.map((s) => ({
      skill_id: s.skillId,
      name: s.name,
      level_required: s.levelRequired ?? null,
      years_required: s.yearsRequired ?? null,
      must_have: s.mustHave ?? false,
    })),
  };
}

export function mapAdminUserListResponse(
  raw: AdminUserListResponseRaw,
): AdminUserListResponse {
  return {
    users: raw.users.map(mapUserRaw),
    total: raw.total,
    page: raw.page,
    totalPages: raw.totalPages,
  };
}

export function mapCompanyListResponse(
  raw: CompanyListResponseRaw,
): CompanyListResponse {
  return {
    companies: raw.companies.map(mapCompanyRaw),
    total: raw.total,
    page: raw.page,
    totalPages: raw.totalPages,
  };
}

export function mapApproveJobResponse(
  raw: ApproveJobResponseRaw,
): ApproveJobResponse {
  return {
    jobId: raw.jobId,
    status: raw.status,
    auditedAt: raw.audited_at,
  };
}

export function mapRejectJobResponse(
  raw: RejectJobResponseRaw,
): RejectJobResponse {
  return {
    jobId: raw.jobId,
    status: raw.status,
    reason: raw.reason,
    auditedAt: raw.audited_at,
  };
}

export function mapVerifyCompanyResponseRaw(
  raw: VerifyCompanyResponseRaw,
): VerifyCompanyResponse {
  return {
    companyId: raw.company_id,
    status: raw.status,
    rejectionReason: raw.rejection_reason,
    verifiedAt: raw.verified_at,
    reviewedBy: raw.reviewed_by,
  };
}
