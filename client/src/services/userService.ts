// src/services/userService.ts
import { api } from "@/api";
import type {
  FavoriteJobListResponse,
  FavoriteJobListResponseRaw,
} from "@/types";
import { mapJobRaw } from "@/types";

// Yêu thích job
export async function toggleFavorite(jobId: string): Promise<unknown> {
  const res = await api.post(`/api/users/favorite/${jobId}`);
  return res.data;
}

// Lấy danh sách job yêu thích
export async function getFavoriteJobs(): Promise<FavoriteJobListResponse> {
  const res = await api.get<FavoriteJobListResponseRaw>("/api/users/favorite");

  return {
    jobs: res.data.jobs.map(mapJobRaw),
    total: res.data.total,
  };
}
