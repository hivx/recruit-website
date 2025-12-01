// src/services/jobService.ts
import { api } from "@/api";
import type { JobListResponse, JobDetailResponse } from "@/interfaces";
import { mapJobRaw, mapJobDetailRaw } from "@/types";
import type { Job, PaginatedJobs, JobDetail, JobSearchQuery } from "@/types";

export async function getJobs(
  page = 1,
  limit = 10,
  filter: JobSearchQuery = {},
): Promise<PaginatedJobs<Job>> {
  const params: Record<string, unknown> = {
    page,
    limit,
  };

  // search text
  if (filter.search) {
    params.search = filter.search;
  }

  // tag[] → tag=Sale&tag=IT
  if (Array.isArray(filter.tags) && filter.tags.length > 0) {
    params.tag = filter.tags;
  }

  const res = await api.get<JobListResponse>("/api/jobs", {
    params,
    paramsSerializer: {
      serialize: (paramsObj: Record<string, unknown>): string => {
        const qs = new URLSearchParams();

        for (const key of Object.keys(paramsObj)) {
          const value = paramsObj[key];

          if (Array.isArray(value)) {
            for (const item of value) {
              qs.append(key, String(item));
            }
          } else if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
          ) {
            qs.append(key, String(value));
          }
          // các loại khác (object, null, undefined) → bỏ qua
        }

        return qs.toString();
      },
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
