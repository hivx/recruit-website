// /src/types/mappers.ts
import type { Job, Application, User } from '@/types';

// helper: parse date an toàn
const safeDate = (val?: string) =>
  val && !isNaN(Date.parse(val)) ? new Date(val).toISOString() : '';

/** Raw types từ BE (swagger) */
type RawJob = {
  id: number;
  title: string;
  company: string;
  location?: string;
  description?: string;
  salary_min?: number;
  salary_max?: number;
  requirements?: string;
  created_by_name: string;
  created_at?: string | null;
  updated_at?: string | null;
  tags?: (string | { tag: string })[];
  createdAtFormatted?: string;
  isFavorite?: boolean;
};

type RawUser = {
  id: number;
  name: string;
  email: string;
  isVerified: boolean;
  role: 'admin' | 'recruiter' | 'applicant';
  avatar: string;
  created_at?: string | null;
};

type RawApplication = {
  id: string;
  job_id: string;
  applicant_id: string;
  cover_letter: string;
  cv?: string;
  phone?: string;
  created_at?: string | null;
};

// MAPPER: Job
export function normalizeJob(raw: RawJob): Job {
  return {
    id: raw.id,
    title: raw.title ?? '',
    company: raw.company ?? '',
    location: raw.location ?? '',
    description: raw.description ?? '',
    salaryMin: raw.salary_min,
    salaryMax: raw.salary_max,
    requirements: raw.requirements ?? '',
    createdByName: raw.created_by_name,
    createdAt: safeDate(raw.created_at ?? undefined),
    updatedAt: safeDate(raw.updated_at ?? undefined),
    tags: Array.isArray(raw.tags)
      ? raw.tags.map((t) =>
          typeof t === 'string' ? t : String((t as { tag: string }).tag)
        )
      : [],
    createdAtFormatted: raw.createdAtFormatted,
    isFavorite: raw.isFavorite,
  };
}

// MAPPER: User
export function normalizeUser(raw: RawUser): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    isVerified: raw.isVerified,
    role: raw.role,
    avatar: raw.avatar,
    createdAt: safeDate(raw.created_at ?? undefined),
  };
}

// MAPPER: Application
export function normalizeApplication(raw: RawApplication): Application {
  return {
    id: String(raw.id),
    jobId: String(raw.job_id),
    applicantId: String(raw.applicant_id),
    coverLetter: raw.cover_letter,
    cv: raw.cv,
    phone: raw.phone,
    createdAt: safeDate(raw.created_at ?? undefined),
  };
}
