// src/hooks/useApplications.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  applyToJob,
  updateApplication,
  getApplicantsByJob,
  reviewApplicant,
  getMyApplications,
  getRecruiterApplications,
} from "@/services";
import type {
  Application,
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
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}

/** =======================================================
 * 4) Recruiter xem danh sách đơn ứng tuyển
 ======================================================= */
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

/** =======================================================
 * 5) Applicant ứng tuyển công việc
 ======================================================= */
export function useApplyToJob() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; application: Application },
    Error,
    {
      jobId: string;
      coverLetter: string;
      phone?: string;
      cvFile: File;
    }
  >({
    mutationFn: (payload) => applyToJob(payload),

    async onSuccess(_, variables) {
      // Refresh danh sách hồ sơ của applicant
      await queryClient.invalidateQueries({
        queryKey: ["my-applications"],
      });

      // Refresh danh sách ứng viên của job
      await queryClient.invalidateQueries({
        queryKey: ["applicants-by-job", variables.jobId],
      });
    },
  });
}

/** =======================================================
 * 6) Applicant cập nhật hồ sơ ứng tuyển
 ======================================================= */
export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; application: Application },
    Error,
    {
      applicationId: string;
      payload: {
        coverLetter?: string;
        phone?: string;
        cvFile?: File;
      };
    }
  >({
    mutationFn: ({ applicationId, payload }) =>
      updateApplication(applicationId, payload),

    async onSuccess(result) {
      const app = result.application;

      // Refresh danh sách hồ sơ của applicant
      await queryClient.invalidateQueries({
        queryKey: ["my-applications"],
      });

      // Nếu biết jobId → refresh danh sách ứng viên của job
      if (app.jobId) {
        await queryClient.invalidateQueries({
          queryKey: ["applicants-by-job", app.jobId],
        });
      }
    },
  });
}
