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
  created_at: string;
}

export interface CandidateRecommendation {
  id: string;
  recruiterId: string;
  applicantId: string;
  fitScore: number;
  createdAt: string;
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
