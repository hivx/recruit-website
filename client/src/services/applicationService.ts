// src/services/applicationService.ts
import { api, isAxiosError } from "@/api";
import type {
  RecruiterApplicationsResponse,
  RecruiterApplicationsResponseRaw,
  ApplicantsByJobResponse,
  ApplicantsByJobResponseRaw,
  ReviewApplicantPayload,
  ReviewApplicantResponse,
  ReviewApplicantResponseRaw,
  MyApplicationsResponse,
  MyApplicationsResponseRaw,
} from "@/types";
import { mapApplicationRaw } from "@/types";

/** =============================
 * 1) Lấy danh sách ứng viên theo job
 * GET /api/applications/job/:jobId
 ============================== */
export async function getApplicantsByJob(
  jobId: string,
): Promise<ApplicantsByJobResponse> {
  const res = await api.get<ApplicantsByJobResponseRaw>(
    `/api/applications/job/${jobId}`,
  );

  return {
    totalApplicants: res.data.totalApplicants,
    applicants: res.data.applicants.map(mapApplicationRaw),
  };
}

/** =============================
 * 2) Review ứng viên
 * PATCH /api/applications/:id/review
 ============================== */
export async function reviewApplicant(
  applicationId: string,
  payload: ReviewApplicantPayload,
): Promise<ReviewApplicantResponse> {
  try {
    const res = await api.patch<ReviewApplicantResponseRaw>(
      `/api/applications/${applicationId}/review`,
      payload,
    );

    return {
      message: res.data.message,
      application: mapApplicationRaw(res.data.application),
    };
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      throw err;
    }
    throw new Error("Unexpected error while reviewing applicant");
  }
}

/** =============================
 * 3) Lấy danh sách ứng tuyển của chính user
 * GET /api/applications/me
 ============================== */
export async function getMyApplications(): Promise<MyApplicationsResponse> {
  try {
    const res = await api.get<MyApplicationsResponseRaw>(
      "/api/applications/me",
    );

    return {
      total: res.data.total,
      applications: res.data.applications.map(mapApplicationRaw),
    };
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      throw err;
    }
    throw new Error("Unexpected error when fetching my applications");
  }
}

/** =============================
 * 4) Lấy danh sách đơn ứng tuyển vào job của recruiter
 * GET /api/applications/recruiter
 ============================== */
export async function getRecruiterApplications(params: {
  page?: number;
  limit?: number;
  status?: string;
  jobId?: string;
}): Promise<RecruiterApplicationsResponse> {
  const res = await api.get<RecruiterApplicationsResponseRaw>(
    "/api/applications/recruiter",
    { params },
  );

  return {
    ...res.data,
    applicants: res.data.applicants.map(mapApplicationRaw),
  };
}
