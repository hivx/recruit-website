// src/types/application.ts

/** Trạng thái ứng tuyển (theo schema) */
export type ApplicationStatus =
  | "pending"
  | "reviewing"
  | "accepted"
  | "rejected";

/** Raw từ BE (toApplicationDTO) */
export interface ApplicationRaw {
  id: string;
  job_id: string;
  applicant_id: string;
  cover_letter: string;
  cv: string | null;
  phone: string | null;
  status: ApplicationStatus;

  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;

  fit_score: number;

  created_at: string;
  updated_at: string;

  job?: {
    id: string;
    title: string;
  };

  applicant?: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
}

/** Application FE (camelCase) */
export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  coverLetter: string;
  cv: string | null;
  phone: string | null;
  status: ApplicationStatus;

  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;

  fitScore: number;

  createdAt: string;
  updatedAt: string;

  job?: {
    id: string;
    title: string;
  };

  applicant?: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
}
