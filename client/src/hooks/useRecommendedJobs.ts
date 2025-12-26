// src/hooks/useRecommendedJobs.ts
import { useQuery } from "@tanstack/react-query";
import { getRecommendedJobs, getRecommendedCandidates } from "@/services";
import type {
  RecommendedJobResponse,
  RecommendedCandidateResponse,
} from "@/types";

export function useRecommendedJobs(
  userId?: number,
  filters: Record<string, unknown> = {},
) {
  return useQuery<RecommendedJobResponse>({
    queryKey: ["recommended-jobs", userId, filters],
    enabled: Boolean(userId),
    queryFn: () => {
      if (!userId) {
        throw new Error("Missing user id");
      }
      return getRecommendedJobs(userId, filters);
    },
  });
}

/**
 * Hook lấy danh sách ứng viên được đề xuất cho recruiter
 */
export function useRecommendedCandidates(
  recruiterId?: number,
  filters: Record<string, unknown> = {},
) {
  return useQuery<RecommendedCandidateResponse>({
    queryKey: ["recommended-candidates", recruiterId, filters],
    enabled: Boolean(recruiterId),
    queryFn: () => {
      if (!recruiterId) {
        throw new Error("Missing recruiter id");
      }
      return getRecommendedCandidates(recruiterId, filters);
    },
  });
}
