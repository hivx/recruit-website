// src/types/recommendation.ts

/** Gợi ý job cho user (ứng viên) */
export interface JobRecommendationRaw {
  id: string;
  user_id: string;
  job_id: string;
  fit_score: number;
  created_at: string;
}

export interface JobRecommendation {
  id: string;
  userId: string;
  jobId: string;
  fitScore: number;
  createdAt: string;
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
