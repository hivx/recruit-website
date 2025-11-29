// src/services/jobService.ts
import { api } from "@/api";
import type { JobListResponse, JobDetailResponse } from "@/interfaces";
import { mapJobRaw, mapJobDetailRaw } from "@/types";
import type { Job, PaginatedJobs, JobDetail } from "@/types";

export async function getJobs(
  page = 1,
  limit = 20,
  queryObj: Record<string, unknown> = {},
): Promise<PaginatedJobs<Job>> {
  const res = await api.get<JobListResponse>("/api/jobs", {
    params: {
      page,
      limit,
      ...queryObj, // <–– search, tag[], ...
    },
    paramsSerializer: {
      indexes: null, // <–– để tag[]=a trở thành tag=a&tag=b
    },
  });

  const rawJobs = res.data.jobs ?? [];

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
