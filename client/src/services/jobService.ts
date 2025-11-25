// src/services/jobService.ts
import { api } from "@/api";
import { mapJobRaw, mapJobDetailRaw } from "@/types";
import type { Job, JobRaw, PaginatedJobs, JobDetail } from "@/types";

export async function getJobs(
  page = 1,
  limit = 10
): Promise<PaginatedJobs<Job>> {
  const res = await api.get("/api/jobs", { params: { page, limit } });

  const rawJobs = Array.isArray(res.data.jobs)
    ? (res.data.jobs as JobRaw[])
    : [];

  return {
    jobs: rawJobs.map(mapJobRaw),
    total: res.data.total ?? 0,
    page: res.data.page ?? 1,
    totalPages: res.data.totalPages ?? 1,
  };
}

export async function getJobById(id: string): Promise<JobDetail> {
  const res = await api.get(`/api/jobs/${id}`);
  return mapJobDetailRaw(res.data as JobRaw);
}
