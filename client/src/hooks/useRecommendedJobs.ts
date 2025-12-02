import { useQuery } from "@tanstack/react-query";
import { getRecommendedJobs } from "@/services/recommendationService";
import type { RecommendedJobResponse } from "@/services/recommendationService";

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
