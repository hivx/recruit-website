// src/services/recommendationService.ts
import { api } from "@/api";
import type {
  RecommendedJobResponse,
  RecommendedJobResponseRaw,
  RecommendedCandidateResponse,
  RecommendedCandidateResponseRaw,
} from "@/types";
import { mapJobRecommendation, mapCandidateRecommendation } from "@/types";

export async function getRecommendedJobs(
  userId: number,
  params: Record<string, unknown> = {},
): Promise<RecommendedJobResponse> {
  const res = await api.get<RecommendedJobResponseRaw>(
    `api/recommendations/${userId}`,
    { params },
  );

  return {
    ...res.data,
    items: res.data.items.map(mapJobRecommendation),
  };
}

/**
 * Lấy danh sách ứng viên được đề xuất cho recruiter
 */
export async function getRecommendedCandidates(
  recruiterId: number,
  params: Record<string, unknown> = {},
): Promise<RecommendedCandidateResponse> {
  const res = await api.get<RecommendedCandidateResponseRaw>(
    `api/recommendations/recruiter/${recruiterId}`,
    { params },
  );

  return {
    ...res.data,
    items: res.data.items.map(mapCandidateRecommendation),
  };
}
