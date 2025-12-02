// src/services/recommendationService.ts
import { api } from "@/api";
import type { JobRecommendationRaw, JobRecommendation } from "@/types";
import { mapJobRecommendation } from "@/types/mappers";

export interface RecommendedJobResponse {
  items: JobRecommendation[];
  total: number;
  page: number;
  totalPages: number;
}

interface RecommendedJobResponseRaw {
  items: JobRecommendationRaw[];
  total: number;
  page: number;
  totalPages: number;
}

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
