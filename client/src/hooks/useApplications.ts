// src/hooks/useApplications.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getApplicantsByJob,
  reviewApplicant,
  getMyApplications,
  getRecruiterApplications,
} from "@/services";
import type {
  ApplicantsByJobResponse,
  ReviewApplicantPayload,
  ReviewApplicantResponse,
  MyApplicationsResponse,
  RecruiterApplicationsResponse,
} from "@/types";

/** =======================================================
 * 1) Lấy danh sách ứng viên ứng tuyển vào 1 job
 ======================================================= */
export function useApplicantsByJob(jobId: string | null) {
  return useQuery<ApplicantsByJobResponse, Error>({
    queryKey: ["applicants-by-job", jobId],
    enabled: Boolean(jobId),
    queryFn: () => {
      if (!jobId) {
        throw new Error("Missing jobId");
      }
      return getApplicantsByJob(jobId);
    },
  });
}

/** =======================================================
 * 2) Review ứng viên
 ======================================================= */
export function useReviewApplicant() {
  const queryClient = useQueryClient();

  return useMutation<
    ReviewApplicantResponse,
    Error,
    { id: string; payload: ReviewApplicantPayload }
  >({
    mutationFn: ({ id, payload }) => reviewApplicant(id, payload),

    async onSuccess(_, variables) {
      // Làm mới danh sách ứng viên của job đó
      await queryClient.invalidateQueries({
        queryKey: ["applicants-by-job", variables.id],
      });
    },
  });
}

/** =======================================================
 * 3) Applicant xem danh sách hồ sơ ứng tuyển của chính mình
 ======================================================= */
export function useMyApplications() {
  return useQuery<MyApplicationsResponse, Error>({
    queryKey: ["my-applications"],
    queryFn: getMyApplications,
  });
}

export function useRecruiterApplications(params: {
  page?: number;
  limit?: number;
  status?: string;
  jobId?: string;
}) {
  return useQuery<RecruiterApplicationsResponse, Error>({
    queryKey: ["recruiter-applications", params],
    queryFn: () => getRecruiterApplications(params),
    placeholderData: (prev) => prev,
    staleTime: 5_000,
  });
}
