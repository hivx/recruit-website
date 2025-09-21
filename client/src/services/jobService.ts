// src/services/jobService.ts
import { api } from "@/api";
import { normalizeJob } from "@/types/mappers";
import type {
  Job,
  JobCreatePayload,
  JobUpdatePayload,
  PaginatedJobs,
} from "@/types";

/** Lấy danh sách job với phân trang */
export async function getJobs(
  page = 1,
  limit = 10
): Promise<PaginatedJobs<Job>> {
  const res = await api.get("/api/jobs", { params: { page, limit } });

  return {
    jobs: (res.data.jobs ?? []).map(normalizeJob),
    total: res.data.total ?? 0,
    page: res.data.page ?? 1,
    totalPages: res.data.totalPages ?? 1,
  };
}

/** Lấy chi tiết job theo ID */
export async function getJobById(id: number): Promise<Job> {
  const res = await api.get(`/api/jobs/${id}`);
  return normalizeJob(res.data);
}

/** Tạo job mới */
export async function createJob(jobData: JobCreatePayload): Promise<Job> {
  const res = await api.post("/api/jobs", jobData);
  return normalizeJob(res.data);
}

/** Cập nhật job */
export async function updateJob(
  id: number,
  jobData: JobUpdatePayload
): Promise<Job> {
  const res = await api.put(`/api/jobs/${id}`, jobData);
  return normalizeJob(res.data);
}

/** Xóa job */
export async function deleteJob(id: number): Promise<void> {
  await api.delete(`/api/jobs/${id}`);
}
