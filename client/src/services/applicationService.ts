// src/services/applicationService.ts
import { api, isAxiosError } from "@/api";
import type {
  Application,
  ApplicationRaw,
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

/** =============================
 * 5) Ứng tuyển công việc
 * POST /api/applications
 ============================== */
export async function applyToJob(params: {
  jobId: string;
  coverLetter: string;
  phone?: string;
  cvFile: File;
}): Promise<{ message: string; application: Application }> {
  try {
    const formData = new FormData();
    formData.append("jobId", params.jobId);
    formData.append("coverLetter", params.coverLetter);
    if (params.phone) {
      formData.append("phone", params.phone);
    }
    formData.append("cv", params.cvFile);

    const res = await api.post<{
      message: string;
      application: ApplicationRaw;
    }>("/api/applications", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      message: res.data.message,
      application: mapApplicationRaw(res.data.application),
    };
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      throw err;
    }
    throw new Error("Unexpected error while applying for job");
  }
}

/** =============================
 * 6) Cập nhật hồ sơ ứng tuyển
 * PUT /api/applications/:id
 ============================== */
export async function updateApplication(
  applicationId: string,
  params: {
    coverLetter?: string;
    phone?: string;
    cvFile?: File;
  },
): Promise<{ message: string; application: Application }> {
  try {
    const formData = new FormData();

    if (params.coverLetter !== undefined) {
      formData.append("coverLetter", params.coverLetter);
    }
    if (params.phone !== undefined) {
      formData.append("phone", params.phone);
    }
    if (params.cvFile) {
      formData.append("cv", params.cvFile);
    }

    const res = await api.put<{
      message: string;
      application: ApplicationRaw;
    }>(`/api/applications/${applicationId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      message: res.data.message,
      application: mapApplicationRaw(res.data.application),
    };
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      throw err;
    }
    throw new Error("Unexpected error while updating application");
  }
}
