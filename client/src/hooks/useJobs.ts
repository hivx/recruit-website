// src/hooks/useJobs.ts
import { useQuery } from "@tanstack/react-query";
import { getJobs, getJobById } from "@/services/jobService";
import type { Job, PaginatedJobs, JobSearchQuery } from "@/types";

/** Hook: Lấy danh sách Job với phân trang + search/filter */
export function useJobs(page: number, limit: number, filter: JobSearchQuery) {
  return useQuery<PaginatedJobs<Job>, Error>({
    queryKey: ["jobs", page, limit, filter], // <— cache theo filter đúng
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
