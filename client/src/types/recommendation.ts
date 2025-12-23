// src/types/recommendation.ts
import type { JobRaw, Job } from "@/types";

/** Gợi ý job cho user (ứng viên) */
export interface JobRecommendationRaw {
  user_id: number;
  job_id: number;
  fit_score: number;
  reason: string;
  status: string;
  job: JobRaw;
}

export interface JobRecommendation {
  userId: number;
  jobId: number;
  fitScore: number;
  reason: string;
  status: string;
  job: Job;
}

/** Gợi ý candidate cho recruiter */
export interface CandidateRecommendationRaw {
  id: string;
  recruiter_id: string;
  applicant_id: string;

  fit_score: number;
  reason: string;
  status: string;

  recommended_at: string;
  updated_at: string;

  is_sent: boolean;
  sent_at: string | null;

  applicant: {
    id: string;
    name: string;
    email?: string | null;
    avatar?: string | null;
    role: "applicant" | "admin";

    vector?: {
      preferred_location?: string | null;
    };
  };

  recruiter: {
    id: string;
    name: string;
    avatar?: string | null;
    role: "recruiter" | "admin";
  };
}

export interface CandidateRecommendation {
  id: string;
  recruiterId: number;
  applicantId: number;

  fitScore: number;
  reason: string;
  status: string;

  recommendedAt: string;
  updatedAt: string;

  isSent: boolean;
  sentAt?: string | null;

  applicant: {
    id: number;
    name: string;
    email?: string | null;
    avatar?: string | null;
    preferredLocation?: string | null;
  };

  recruiter: {
    id: number;
    name: string;
    avatar?: string | null;
  };
}

export interface RecommendedJobResponse {
  items: JobRecommendation[];
  total: number;
  page: number;
  totalPages: number;
}

export interface RecommendedJobResponseRaw {
  items: JobRecommendationRaw[];
  total: number;
  page: number;
  totalPages: number;
}

export interface RecommendedCandidateResponse {
  items: CandidateRecommendation[];
  total: number;
  page: number;
  totalPages: number;
}

export interface RecommendedCandidateResponseRaw {
  items: CandidateRecommendationRaw[];
  total: number;
  page: number;
  totalPages: number;
}
