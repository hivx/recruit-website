// src/hooks/useJobs.ts
import { useQuery } from "@tanstack/react-query";
import { getJobs, getJobById } from "@/services";
import type { Job, PaginatedJobs } from "@/types";

/** Hook: Lấy danh sách Job với phân trang */
export function useJobs(page = 1, limit = 10) {
  return useQuery<PaginatedJobs<Job>, Error>({
    queryKey: ["jobs", page, limit],
    queryFn: () => getJobs(page, limit),
    select: (data) => ({
      ...data,
      jobs: data.jobs ?? [], // fallback tránh undefined
    }),
  });
}

/** Hook: Lấy chi tiết Job theo ID (BigInt → string) */
export function useJobById(id?: string) {
  return useQuery<Job, Error>({
    queryKey: ["job", id],
    enabled: !!id,
    queryFn: ({ queryKey }) => {
      const [, jobId] = queryKey;
      return getJobById(jobId as string);
    },
  });
}
