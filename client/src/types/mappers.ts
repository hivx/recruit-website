// src/types/mappers.ts
import type { Application, ApplicationRaw } from "./application";

import type {
  Company,
  CompanyRaw,
  CompanyVerification,
  CompanyVerificationRaw,
} from "./company";
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
} from "./job";

import type {
  CareerPreference,
  CareerPreferenceRaw,
  RecruiterPreference,
  RecruiterPreferenceRaw,
  RecruiterRequiredSkill,
  RecruiterRequiredSkillRaw,
} from "./preference";
import type {
  JobRecommendation,
  JobRecommendationRaw,
  CandidateRecommendation,
  CandidateRecommendationRaw,
} from "./recommendation";
import type { User, UserRaw } from "./user";

import type { BehaviorProfile, BehaviorProfileRaw } from "./vector";

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
    skillName: raw.skill_name,
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

export function mapCandidateRecommendationRaw(
  raw: CandidateRecommendationRaw,
): CandidateRecommendation {
  return {
    id: raw.id,
    recruiterId: raw.recruiter_id,
    applicantId: raw.applicant_id,
    fitScore: raw.fit_score,
    createdAt: raw.created_at,
  };
}

/* ---------------------------------------------------
 * PREFERENCE MAPPERS
 * --------------------------------------------------- */

export function mapCareerPreferenceRaw(
  raw: CareerPreferenceRaw,
): CareerPreference {
  return {
    userId: raw.user_id,
    desiredRoles: raw.desired_roles ?? [],
    desiredLocations: raw.desired_locations ?? [],
    desiredSalary: raw.desired_salary,
    expectedCompanySize: raw.expected_company_size,
  };
}

function mapRecruiterRequiredSkillRaw(
  raw: RecruiterRequiredSkillRaw,
): RecruiterRequiredSkill {
  return {
    skillId: raw.skill_id,
    yearsRequired: raw.years_required,
    mustHave: raw.must_have,
  };
}

export function mapRecruiterPreferenceRaw(
  raw: RecruiterPreferenceRaw,
): RecruiterPreference {
  return {
    userId: raw.user_id,
    requiredSkills: mapArray(raw.required_skills, mapRecruiterRequiredSkillRaw),
    preferredLocations: raw.preferred_locations ?? [],
    desiredSalaryMin: raw.desired_salary_min,
    desiredSalaryMax: raw.desired_salary_max,
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
