// src/hooks/useMyCompany.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyCompany,
  createCompany,
  updateCompany,
  submitCompanyVerification,
} from "@/services";
import type { Company } from "@/types";

// Retrieve recruiter’s company
export function useMyCompany() {
  return useQuery<Company | null, Error>({
    queryKey: ["my-company"],
    queryFn: getMyCompany,
    retry: false,
    select: (data) => data ?? null,
  });
}

// Create company
export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createCompany(formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-company"] });
    },
  });
}

// Update company
export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => updateCompany(formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-company"] });
    },
  });
}

// Submit verification
export function useSubmitCompanyVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitCompanyVerification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-company"] });
    },
  });
}
