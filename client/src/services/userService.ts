/* eslint-disable prettier/prettier */
// src/services/userService.ts
import { api } from "@/api";
import type {
  FavoriteJobListResponse,
  FavoriteJobListResponseRaw,
  UpdateProfilePayload,
  UpdateProfileResponse,
  ChangePasswordPayload,
  AdminCreateUserPayload,
  AdminUpdateUserPayload,
  AdminSetUserActivePayload,
  AdminUserListResponseRaw,
  AdminUserListResponse,
  UserRaw,
  User,
} from "@/types";
import { mapJobRaw, mapUserRaw, mapAdminUserListResponse } from "@/types";

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

/* =========================
 * ADMIN USER
 * ========================= */

export async function adminCreateUser(
  payload: AdminCreateUserPayload,
): Promise<{ message: string; user: User }> {
  const res = await api.post<{
    message: string;
    user: UserRaw;
  }>("/api/users/admin/users", payload);

  return {
    message: res.data.message,
    user: mapUserRaw(res.data.user),
  };
}

export interface AdminUserListParams {
  role?: "admin" | "recruiter" | "applicant";
  isVerified?: boolean;
  page?: number;
  limit?: number;
}

export async function adminGetUsers(
  params: AdminUserListParams = {},
): Promise<AdminUserListResponse> {
  const res = await api.get<AdminUserListResponseRaw>(
    "/api/users/admin/users",
    {
      params,
    },
  );

  return mapAdminUserListResponse(res.data);
}

export async function adminUpdateUser(
  userId: string,
  payload: AdminUpdateUserPayload,
): Promise<{ message: string; user: User }> {
  const res = await api.put<{
    message: string;
    user: UserRaw;
  }>(`/api/users/admin/users/${userId}`, payload);

  return {
    message: res.data.message,
    user: mapUserRaw(res.data.user),
  };
}

export async function adminSetUserActive(
  userId: string,
  payload: AdminSetUserActivePayload,
): Promise<{ message: string; user: User }> {
  const res = await api.patch<{
    message: string;
    user: UserRaw;
  }>(`/api/users/admin/users/${userId}/status`, payload);

  return {
    message: res.data.message,
    user: mapUserRaw(res.data.user),
  };
}

export async function adminDeleteUser(
  userId: string,
): Promise<{ message: string; success: boolean }> {
  const res = await api.delete<{
    message: string;
    success: boolean;
  }>(`/api/users/admin/users/${userId}`);

  return res.data;
}
