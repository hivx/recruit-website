// src/hooks/useJobs.ts
import { useQuery } from "@tanstack/react-query";
import { getJobs, getJobById } from "@/services";
import type { Job, PaginatedJobs } from "@/types";

/** Hook: Lấy danh sách Job với phân trang + search/filter */
export function useJobs(
  page = 1,
  limit = 10,
  queryObj: Record<string, unknown> = {},
) {
  return useQuery<PaginatedJobs<Job>, Error>({
    queryKey: ["jobs", page, limit, queryObj], // <-- theo dõi queryObj
    queryFn: () => getJobs(page, limit, queryObj),
    select: (data) => ({
      ...data,
      jobs: data.jobs ?? [], // tránh undefined
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
