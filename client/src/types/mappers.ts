// src/types/mappers.ts
import type { Job, Application, User, JobTag, Tag } from "@/types";

// helper: parse date an toàn
const safeDate = (val?: string | null) =>
  val && !Number.isNaN(Date.parse(val)) ? new Date(val).toISOString() : "";

/** Raw types từ BE (swagger / Prisma raw JSON) */
type RawJob = {
  id: string; // BigInt → string
  title: string;
  company: string;
  location?: string | null;
  description?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  requirements?: string | null;
  created_by: string; // BigInt → string
  created_by_name: string;
  created_at?: string | null;
  updated_at?: string | null;
  tags?: {
    jobId: string; // BigInt → string
    tagId: number;
    tag: { id: number; name: string };
  }[];
  createdAtFormatted?: string;
  isFavorite?: boolean;
};

type RawUser = {
  id: string; // BigInt → string
  name: string;
  email: string;
  isVerified: boolean;
  role: "admin" | "recruiter" | "applicant";
  avatar: string;
  created_at?: string | null;
  updated_at?: string | null;
};

type RawApplication = {
  id: string; // BigInt → string
  job_id: string; // BigInt → string
  applicant_id: string; // BigInt → string
  cover_letter: string;
  cv?: string | null;
  phone?: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at?: string | null;
};

// ================================
//  MAPPER: Job
// ================================
export function normalizeJob(raw: RawJob): Job {
  const tags: JobTag[] = Array.isArray(raw.tags)
    ? raw.tags.map((jt) => ({
        jobId: String(jt.jobId ?? ""),
        tagId: jt.tagId ?? 0,
        tag: {
          id: jt.tag?.id ?? 0,
          name: jt.tag?.name ?? "",
        } as Tag,
      }))
    : [];

  return {
    id: String(raw.id ?? ""),
    title: raw.title ?? "",
    company: raw.company ?? "",
    location: raw.location ?? "",
    description: raw.description ?? "",
    salaryMin: raw.salary_min ?? null,
    salaryMax: raw.salary_max ?? null,
    requirements: raw.requirements ?? "",
    createdBy: String(raw.created_by ?? ""),
    createdByName: raw.created_by_name ?? "",
    createdAt: safeDate(raw.created_at),
    updatedAt: safeDate(raw.updated_at),
    tags,
    createdAtFormatted: raw.createdAtFormatted,
    isFavorite: raw.isFavorite ?? false,
  };
}

// ================================
//  MAPPER: User
// ================================
export function normalizeUser(raw: RawUser): User {
  return {
    id: String(raw.id ?? ""),
    name: raw.name ?? "",
    email: raw.email ?? "",
    isVerified: raw.isVerified ?? false,
    role: raw.role ?? "applicant",
    avatar: raw.avatar ?? "uploads/pic.jpg",
    createdAt: safeDate(raw.created_at),
    updatedAt: safeDate(raw.updated_at),
  };
}

// ================================
//  MAPPER: Application
// ================================
export function normalizeApplication(raw: RawApplication): Application {
  return {
    id: String(raw.id ?? ""),
    jobId: String(raw.job_id ?? ""),
    applicantId: String(raw.applicant_id ?? ""),
    coverLetter: raw.cover_letter ?? "",
    cv: raw.cv ?? undefined,
    phone: raw.phone ?? undefined,
    status: raw.status ?? "pending",
    createdAt: safeDate(raw.created_at),
  };
}
