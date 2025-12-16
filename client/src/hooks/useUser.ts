// src/hooks/useUser.ts
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getFavoriteJobs,
  updateProfile,
  changePassword,
  adminGetUsers,
  adminCreateUser,
  adminUpdateUser,
  adminSetUserActive,
  adminDeleteUser,
} from "@/services";
import type {
  FavoriteJobListResponse,
  UpdateProfilePayload,
  UpdateProfileResponse,
  ChangePasswordPayload,
  AdminUserListResponse,
  AdminCreateUserPayload,
  AdminUpdateUserPayload,
  AdminSetUserActivePayload,
  User,
} from "@/types";

export function useFavoriteJobs() {
  return useQuery<FavoriteJobListResponse>({
    queryKey: ["favorite-jobs"],
    queryFn: getFavoriteJobs,

    staleTime: 1000 * 60 * 3, // 3 phút không refetch
    gcTime: 1000 * 60 * 10, // giữ cache trong 10 phút (v5)

    retry: 1,
    refetchOnWindowFocus: false,
    enabled: true,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<UpdateProfileResponse, Error, UpdateProfilePayload>({
    mutationFn: updateProfile,

    retry: 0, // upload + email => không retry tự động

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["me"],
      });
    },
  });
}

type ChangePasswordResponse = { message: string };

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation<ChangePasswordResponse, Error, ChangePasswordPayload>({
    mutationFn: changePassword,
    retry: 0,

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export interface UseAdminUsersParams {
  role?: "admin" | "recruiter" | "applicant";
  isVerified?: boolean;
  page?: number;
  limit?: number;
}

export function useAdminUsers(params: UseAdminUsersParams) {
  return useQuery<AdminUserListResponse>({
    queryKey: ["admin-users", params],
    queryFn: () => adminGetUsers(params),

    staleTime: 1000 * 60 * 2, // 2 phút
    gcTime: 1000 * 60 * 10,

    retry: 1,
    refetchOnWindowFocus: false,
  });
}

type AdminCreateUserResponse = {
  message: string;
  user: User;
};

export function useAdminCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<AdminCreateUserResponse, Error, AdminCreateUserPayload>({
    mutationFn: adminCreateUser,
    retry: 0,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-users"],
      });
    },
  });
}

type AdminUpdateUserResponse = {
  message: string;
  user: User;
};

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<
    AdminUpdateUserResponse,
    Error,
    { userId: string; payload: AdminUpdateUserPayload }
  >({
    mutationFn: ({ userId, payload }) => adminUpdateUser(userId, payload),

    retry: 0,

    onSuccess: (_data, variables) => {
      // Refresh list
      void queryClient.invalidateQueries({
        queryKey: ["admin-users"],
      });

      // Optional: cập nhật cache chi tiết user nếu có
      void queryClient.invalidateQueries({
        queryKey: ["admin-user", variables.userId],
      });
    },
  });
}

type AdminSetUserActiveResponse = {
  message: string;
  user: User;
};

export function useAdminSetUserActive() {
  const queryClient = useQueryClient();

  return useMutation<
    AdminSetUserActiveResponse,
    Error,
    { userId: string; payload: AdminSetUserActivePayload }
  >({
    mutationFn: ({ userId, payload }) => adminSetUserActive(userId, payload),

    retry: 0,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-users"],
      });
    },
  });
}

type AdminDeleteUserResponse = {
  message: string;
  success: boolean;
};

export function useAdminDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<AdminDeleteUserResponse, Error, { userId: string }>({
    mutationFn: ({ userId }) => adminDeleteUser(userId),
    retry: 0,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-users"],
      });
    },
  });
}
