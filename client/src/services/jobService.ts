// src/services/jobService.ts
import { api } from "@/api";
import type { JobListResponse, JobDetailResponse } from "@/interfaces";
import { mapJobRaw, mapJobDetailRaw } from "@/types";
import type { Job, PaginatedJobs, JobDetail } from "@/types";

export async function getJobs(
  page = 1,
  limit = 10,
): Promise<PaginatedJobs<Job>> {
  const res = await api.get<JobListResponse>("/api/jobs", {
    params: { page, limit },
  });

  const rawJobs = res.data.jobs;

  return {
    jobs: rawJobs.map(mapJobRaw),
    total: res.data.total ?? 0,
    page: res.data.page ?? 1,
    totalPages: res.data.totalPages ?? 1,
  };
}

export async function getJobById(id: string): Promise<JobDetail> {
  const res = await api.get<JobDetailResponse>(`/api/jobs/${id}`);
  return mapJobDetailRaw(res.data);
}
