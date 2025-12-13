/* eslint-disable prettier/prettier */
// src/services/userService.ts
import { api } from "@/api";
import type {
  FavoriteJobListResponse,
  FavoriteJobListResponseRaw,
  UpdateProfilePayload,
  UpdateProfileResponse,
  ChangePasswordPayload,
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

/* =========================
 * UPDATE USER PROFILE
 * ========================= */

export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<UpdateProfileResponse> {
  const formData = new FormData();

  if (payload.name) {
    formData.append("name", payload.name);
  }

  if (payload.email) {
    formData.append("email", payload.email);
  }

  if (payload.avatar) {
    formData.append("avatar", payload.avatar);
  }

  const res = await api.put<UpdateProfileResponse>(
    "/api/users/me",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return res.data;
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<{ message: string }> {
  const res = await api.put("/api/users/change-password", payload);
  return res.data as { message: string };
}