// /src/types/mappers.ts
import type { Job, Application, User } from '@/types';

// Raw types từ API (giống schema BE trả về)
type RawJob = {
  _id: string;
  title: string;
  tags?: string[];
  company: string;
  location?: string;
  description?: string;
  salary?: string;
  requirements?: string;
  createdBy: string;
  createdByName: string;
  createdAt?: string;
  updatedAt?: string;
  isFavorite?: boolean;
};

type RawApplication = {
  _id: string;
  job: RawJob | string; // Có thể là ID hoặc object Job
  applicant: RawUser | string; // Có thể là ID hoặc object User
  coverLetter: string;
  cv?: string;
  phone?: string;
  createdAt?: string;
};

type RawUser = {
  _id: string;
  name: string;
  email: string;
  isVerified?: boolean;
  role: 'admin' | 'recruiter' | 'applicant';
  favoriteJobs?: (RawJob | string)[];
  createdAt?: string;
};

// MAPPER: Job
export function normalizeJob(raw: RawJob): Job {
  return {
    _id: String(raw._id),
    title: raw.title ?? '',
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    company: raw.company ?? '',
    location: raw.location ?? '',
    description: raw.description ?? '',
    salary: raw.salary ?? '',
    requirements: raw.requirements ?? '',
    createdBy: raw.createdBy ?? '',
    createdByName: raw.createdByName ?? '',
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : '',
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : '',
  };
}

// MAPPER: User
export function normalizeUser(raw: RawUser): User {
  return {
    _id: String(raw._id),
    name: raw.name,
    email: raw.email,
    isVerified: raw.isVerified ?? false,
    role: raw.role,
    favoriteJobs: Array.isArray(raw.favoriteJobs)
      ? raw.favoriteJobs.map((job) =>
          typeof job === 'string' ? String(job) : String(job._id)
        )
      : [],
    createdAt: raw.createdAt ?? '',
  };
}

// MAPPER: Application
export function normalizeApplication(raw: RawApplication): Application {
  return {
    _id: String(raw._id),
    job: typeof raw.job === 'string' ? raw.job : String(raw.job._id),
    applicant:
      typeof raw.applicant === 'string'
        ? raw.applicant
        : String(raw.applicant._id),
    coverLetter: raw.coverLetter,
    cv: raw.cv,
    phone: raw.phone,
    createdAt: raw.createdAt ?? '',
  };
}
