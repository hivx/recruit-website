// src/services/jobService.ts
import { api } from "@/api";
import { mapJobRaw, mapJobDetailRaw } from "@/types";
import type {
  Job,
  PaginatedJobs,
  JobDetail,
  JobSearchQuery,
  JobListResponse,
  JobDetailResponse,
} from "@/types";

export async function getJobs(
  page = 1,
  limit = 10,
  filter: JobSearchQuery = {},
): Promise<PaginatedJobs<Job>> {
  const params: Record<string, unknown> = {
    page,
    limit,
  };

  // TEXT SEARCH
  if (filter.search && filter.search.trim().length > 0) {
    params.search = filter.search.trim();
  }

  // TAG FILTER
  if (Array.isArray(filter.tags) && filter.tags.length > 0) {
    params.tag = filter.tags; // BE expects tag=A&tag=B
  }

  // LOCATION FILTER
  if (filter.location && filter.location.trim().length > 0) {
    params.location = filter.location.trim();
  }

  // SALARY FILTER
  if (
    typeof filter.salaryWanted === "number" &&
    !Number.isNaN(filter.salaryWanted)
  ) {
    params.salaryWanted = filter.salaryWanted;
  }

  const res = await api.get<JobListResponse>("/api/jobs", {
    params,
    paramsSerializer: {
      serialize(paramsObj: Record<string, unknown>): string {
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

export async function getMyJobs(
  page = 1,
  limit = 10,
): Promise<PaginatedJobs<Job>> {
  try {
    const res = await api.get<JobListResponse>("/api/jobs/my-jobs", {
      params: { page, limit },
    });

    const data = res.data;

    const rawJobs = Array.isArray(data.jobs) ? data.jobs : [];

    return {
      jobs: rawJobs.map(mapJobRaw),
      total: typeof data.total === "number" ? data.total : 0,
      page: typeof data.page === "number" ? data.page : page,
      totalPages: typeof data.totalPages === "number" ? data.totalPages : 1,
    };
  } catch (error) {
    // Đảm bảo không bị lỗi unsafe khi error là unknown
    if (error instanceof Error) {
      console.error("getMyJobs error:", error.message);
    } else {
      console.error("getMyJobs unknown error");
    }

    // Trả về object rỗng để UI không crash
    return {
      jobs: [],
      total: 0,
      page: 1,
      totalPages: 1,
    };
  }
}
