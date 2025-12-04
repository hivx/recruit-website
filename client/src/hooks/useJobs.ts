// src/hooks/useJobs.ts
import { useQuery } from "@tanstack/react-query";
import { getJobs, getJobById, getMyJobs } from "@/services";
import type { Job, PaginatedJobs, JobSearchQuery } from "@/types";

/** Hook: Lấy danh sách Job với phân trang + search/filter */
export function useJobs(page: number, limit: number, filter: JobSearchQuery) {
  return useQuery<PaginatedJobs<Job>, Error>({
    queryKey: ["jobs", page, limit, JSON.stringify(filter)],
    queryFn: () => getJobs(page, limit, filter),
    placeholderData: (previousData) => previousData,
    select: (data) => ({
      ...data,
      jobs: data.jobs ?? [],
    }),
  });
}

export function useJobById(id?: string) {
  return useQuery<Job, Error>({
    queryKey: ["job", id],
    enabled: Boolean(id),
    queryFn: () => {
      if (!id) {
        throw new Error("Missing job id");
      }
      return getJobById(id);
    },
  });
}

/** Hook: Lấy danh sách Job thuộc về nhà tuyển dụng hiện tại */
export function useMyJobs(page: number, limit: number) {
  return useQuery<PaginatedJobs<Job>, Error>({
    queryKey: ["my-jobs", page, limit],
    queryFn: () => getMyJobs(page, limit),
    placeholderData: (previousData) => previousData,
    select: (data) => ({
      ...data,
      jobs: data.jobs ?? [],
    }),
  });
}
