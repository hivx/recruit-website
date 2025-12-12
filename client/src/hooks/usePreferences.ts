// src/hooks/useRecruiterPreferences.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRecruiterPreferences,
  updateRecruiterPreferences,
} from "@/services";
import type {
  RecruiterPreference,
  RecruiterPreferenceUpsertRequest,
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
