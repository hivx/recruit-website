// src/services/recommendationService.ts
import { api } from "@/api";
import type {
  RecommendedJobResponse,
  RecommendedJobResponseRaw,
} from "@/types";
import { mapJobRecommendation } from "@/types";

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
