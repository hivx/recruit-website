// src/hooks/useRecruiterPreferences.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRecruiterPreferences,
  updateRecruiterPreferences,
  getCareerPreference,
  upsertCareerPreference,
} from "@/services";
import type {
  RecruiterPreference,
  RecruiterPreferenceUpsertRequest,
  CareerPreference,
  CareerPreferenceUpsert,
} from "@/types";

export function useRecruiterPreferences() {
  return useQuery<RecruiterPreference, Error>({
    queryKey: ["recruiter-preferences"],
    queryFn: getRecruiterPreferences,
    retry: false,
  });
}

export function useUpdateRecruiterPreferences() {
  const queryClient = useQueryClient();

  return useMutation<
    RecruiterPreference,
    Error,
    RecruiterPreferenceUpsertRequest
  >({
    mutationFn: updateRecruiterPreferences,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["recruiter-preferences"],
      });
    },
  });
}

/** =======================================================
 * Applicant: lấy career preference
 ======================================================= */
export function useCareerPreference() {
  return useQuery<CareerPreference | null, Error>({
    queryKey: ["career-preference"],
    queryFn: getCareerPreference,
    retry: false,
  });
}

/** =======================================================
 * Applicant: upsert career preference
 ======================================================= */
export function useUpsertCareerPreference() {
  const queryClient = useQueryClient();

  return useMutation<CareerPreference, Error, CareerPreferenceUpsert>({
    mutationFn: upsertCareerPreference,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["career-preference"],
      });
    },
  });
}
