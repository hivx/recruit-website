// src/hooks/useUser.ts
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getFavoriteJobs, updateProfile, changePassword } from "@/services";
import type {
  FavoriteJobListResponse,
  UpdateProfilePayload,
  UpdateProfileResponse,
  ChangePasswordPayload,
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
